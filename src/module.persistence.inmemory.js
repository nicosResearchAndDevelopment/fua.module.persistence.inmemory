const
    regex_semantic_id = /^https?:\/\/\S+$|^\w+:\S+$/,
    regex_nonempty_key = /\S/,
    array_primitive_types = Object.freeze(["boolean", "number", "string"]);

/**
 * 
 * @param {*} value 
 * @param {String} [errMsg=""] 
 * @param {Class<Error>} [errType=Error] 
 */
function assert(value, errMsg = "", errType = Error) {
    if (!value) {
        const err = new errType(errMsg);
        Error.captureStackTrace(err, assert);
        throw err;
    }
} // assert

/**
 * Returns true, if the value does include at least one nonspace character.
 * @param {String} value 
 * @returns {Boolean}
 */
function is_nonempty_key(value) {
    return regex_nonempty_key.test(value);
} // is_nonempty_key

/**
 * This is an IRI or a prefixed IRI.
 * @typedef {String|IRI} SemanticID
 * 
 * Returns true, if the value is a complete or prefixed IRI.
 * This function is important to distinct values from IRIs and
 * to make sure, subject, predicate and object have valid ids.
 * @param {SemanticID} value 
 * @returns {Boolean}
 */
function is_semantic_id(value) {
    return regex_semantic_id.test(value);
} // is_semantic_id

/**
 * This are the only values neo4j can store on a node.
 * @typedef {null|Boolean|Number|String|Array<Boolean>|Array<Number>|Array<String>} PrimitiveValue 
 * 
 * Returns true, if the value is primitive. This function
 * is important to make sure, a value can be stored in neo4j.
 * @param {PrimitiveValue} value 
 * @returns {Boolean}
 */
function is_primitive_value(value) {
    return value === null
        || array_primitive_types.includes(typeof value)
        || (Array.isArray(value) && array_primitive_types.some(
            type => value.every(arrValue => typeof arrValue === type)
        ));
} // is_primitive_value

/**
 * This is the general concept of a persistence adapter.
 * @typedef {Object} PersistenceAdapter 
 * @property {Function} CREATE Create a resource.
 * @property {Function} READ Return a resource or some properties.
 * @property {Function} UPDATE Update a property or a reference.
 * @property {Function} DELETE Delete a resource or a reference.
 * @property {Function} LIST List targets of a reference on a resource.
 * 
 * This is a persistent adapter with build in methods for in-memory storage.
 * @typedef {PersistenceAdapter} InmemoryAdapter
 * 
 * This is the factory method to build a persistence adapter for in-memory.
 * @param {Object} config 
 * @param {Map<String, Object>} config.storage
 * @returns {InmemoryAdapter}
 */
module.exports = function (config) {

    assert(typeof config === "object" && config !== null,
        "The config for a persistence adapter must be a nonnull object.");
    assert(config["storage"] instanceof Map,
        "The config.storage must contain a map.");

    /** @type {Map<String, Object>} */
    const inmemory_storage = config["storage"];

    /**
     * Uses the inmemory storage map and returns function results.
     * @async
     * @param {string} method 
     * @param  {...*} args 
     * @returns {*}
     */
    async function request_inmemory(method, ...args) {
        return inmemory_storage[method](...args);
        // const result = inmemory_storage[method].apply(inmemory_storage,
        //     args.map(arg => JSON.parse(JSON.stringify(arg)))
        // );
        // return JSON.parse(JSON.stringify(result));
    } // request_inmemory

    /**
     * TODO describe operation EXIST
     * @async
     * @param {SemanticID} subject 
     * @returns {Boolean}
     */
    async function operation_inmemory_exist(subject) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_exist - invalid {SemanticID} subject <${subject}>`);

        return await request_inmemory("has", subject);

    } // operation_inmemory_exist

    /**
     * TODO describe operation CREATE
     * @async
     * @param {SemanticID} subject 
     * @returns {Boolean}
     */
    async function operation_inmemory_create(subject) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_create - invalid {SemanticID} subject <${subject}>`);

        if (await operation_inmemory_exist(subject))
            return false;

        await request_inmemory("set", subject, {
            "@id": subject,
            "@type": ["rdfs:Resource"]
        });
        return true;

    } // operation_inmemory_create

    /**
     * TODO describe operation READ_subject
     * @async
     * @param {SemanticID} subject 
     * @returns {Object|null}
     */
    async function operation_inmemory_read_subject(subject) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_read_subject - invalid {SemanticID} subject <${subject}>`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord) return null;
        return JSON.parse(JSON.stringify(readRecord, (key, value) => value instanceof Set ? undefined : value));

    } // operation_inmemory_read_subject

    /**
     * TODO describe operation READ_type
     * @async
     * @param {SemanticID} subject 
     * @returns {Array<SemanticID>}
     */
    async function operation_inmemory_read_type(subject) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_read_type - invalid {SemanticID} subject <${subject}>`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord) return null;
        return JSON.parse(JSON.stringify(readRecord["@type"]));

    } // operation_inmemory_read_type

    /**
     * TODO describe operation READ
     * @async
     * @param {SemanticID} subject 
     * @param {String|Array<String>} [key] 
     * @returns {Object|null|PrimitiveValue|Array<PrimitiveValue>}
     */
    async function operation_inmemory_read(subject, key) {

        if (!key) return await operation_inmemory_read_subject(subject);
        if (key === "@type") return await operation_inmemory_read_type(subject);

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_read - invalid {SemanticID} subject <${subject}>`);

        const isArray = Array.isArray(key);
        /** @type {Array<String>} */
        const keyArr = isArray ? key : [key];

        assert(keyArr.every(is_nonempty_key),
            `inmemory_adapter - operation_read - {String|Array<String>} ${isArray ? "some " : ""}key <${key}> is empty`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord) return null;

        const valueArr = keyArr.map(key => readRecord[key] instanceof Set ? undefined : JSON.parse(JSON.stringify(readRecord[key])));
        return isArray ? valueArr : valueArr[0];

    } // operation_inmemory_read

    /**
     * TODO describe operation UPDATE_predicate
     * @async
     * @param {SemanticID} subject 
     * @param {SemanticID} predicate 
     * @param {SemanticID} object 
     * @returns {Boolean}
     */
    async function operation_inmemory_update_predicate(subject, predicate, object) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_update_predicate - invalid {SemanticID} subject <${subject}>`);
        assert(is_semantic_id(predicate),
            `inmemory_adapter - operation_update_predicate - invalid {SemanticID} predicate <${predicate}>`);
        assert(is_semantic_id(object),
            `inmemory_adapter - operation_update_predicate - invalid {SemanticID} object <${object}>`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord) return false;
        if (!(predicate in readRecord)) readRecord[predicate] = new Set();
        else if (!(readRecord[predicate] instanceof Set)) return false;
        readRecord[predicate].add(object);
        return true;

    } // operation_inmemory_update_predicate

    /**
     * TODO describe operation UPDATE_type
     * @async
     * @param {SemanticID} subject 
     * @param {SemanticID|Array<SemanticID>} type 
     * @returns {Boolean}
     */
    async function operation_inmemory_update_type(subject, type) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_update_type - invalid {SemanticID} subject <${subject}>`);

        /** @type {Array<SemanticID>} */
        const typeArr = Array.isArray(type) ? [...type] : [type];

        assert(typeArr.every(is_semantic_id),
            `inmemory_adapter - operation_update_type - invalid {SemanticID|Array<SemanticID>} type <${type}>`);
        if (!typeArr.includes("rdfs:Resource"))
            typeArr.push("rdfs:Resource");

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord) return false;
        subject["@type"] = typeArr;
        return true;

    } // operation_inmemory_update_type

    /**
     * TODO describe operation UPDATE
     * @async
     * @param {SemanticID} subject 
     * @param {String|SemanticID} key 
     * @param {PrimitiveValue|SemanticID} value 
     * @returns {Boolean}
     */
    async function operation_inmemory_update(subject, key, value) {

        if (key === "@type") return await operation_inmemory_update_type(subject, value);
        if (is_semantic_id(key) && is_semantic_id(value)) return await operation_inmemory_update_predicate(subject, key, value);

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_update - invalid {SemanticID} subject <${subject}>`);
        assert(is_nonempty_key(key),
            `inmemory_adapter - operation_update - {String|SemanticID} key <${key}> is empty`);
        assert(is_primitive_value(value),
            `inmemory_adapter - operation_update - invalid {PrimitiveValue|SemanticID} value <${value}>`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord || key === "@id") return false;
        readRecord[key] = JSON.parse(JSON.stringify(value));
        return true;

    } // operation_inmemory_update

    /**
     * TODO describe operation DELETE_predicate
     * @async
     * @param {SemanticID} subject 
     * @param {SemanticID} predicate 
     * @param {SemanticID} object 
     * @returns {Boolean} 
     */
    async function operation_inmemory_delete_predicate(subject, predicate, object) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_delete_predicate - invalid {SemanticID} subject <${subject}>`);
        assert(is_semantic_id(predicate),
            `inmemory_adapter - operation_delete_predicate - invalid {SemanticID} predicate <${predicate}>`);
        assert(is_semantic_id(object),
            `inmemory_adapter - operation_delete_predicate - invalid {SemanticID} object <${object}>`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord || !(readRecord[predicate] instanceof Set)) return false;
        return readRecord[predicate].delete(object);

    } // operation_inmemory_delete_predicate

    /**
     * TODO describe operation DELETE
     * @async
     * @param {SemanticID} subject 
     * @param {SemanticID} [predicate] 
     * @param {SemanticID} [object] 
     * @returns {Boolean}
     */
    async function operation_inmemory_delete(subject, predicate, object) {

        if (predicate || object) return await operation_inmemory_delete_predicate(subject, predicate, object);

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_delete - invalid {SemanticID} subject <${subject}>`);

        return await request_inmemory("delete", subject);

    } // operation_inmemory_delete

    /**
     * TODO describe operation LIST
     * @async
     * @param {SemanticID} subject 
     * @param {SemanticID} predicate 
     * @returns {Array<SemanticID>|null}
     */
    async function operation_inmemory_list(subject, predicate) {

        assert(is_semantic_id(subject),
            `inmemory_adapter - operation_list - invalid {SemanticID} subject <${subject}>`);
        assert(is_semantic_id(predicate),
            `inmemory_adapter - operation_list - invalid {SemanticID} predicate <${predicate}>`);

        /** @type {Object|null} */
        const readRecord = await request_inmemory("get", subject);
        if (!readRecord || !(readRecord[predicate] instanceof Set)) return null;
        return Array.from(readRecord[predicate]);

    } // operation_inmemory_list

    /**
     * Creates a promise that times out after a given number of seconds.
     * If the original promise finishes before that, the error or result
     * will be resolved or rejected accordingly and the timeout will be canceled.
     * @param {Promise} origPromise 
     * @param {Number} timeoutDelay 
     * @param {String} [errMsg="This promise timed out after waiting ${timeoutDelay}s for the original promise."] 
     * @returns {Promise}
     */
    function create_timeout_promise(origPromise, timeoutDelay, errMsg) {
        assert(origPromise instanceof Promise,
            "The promise must be a Promise.");
        assert(typeof timeoutDelay === "number" && timeoutDelay > 0,
            "The timeout must be a number greater than 0.");

        let timeoutErr = new Error(typeof errMsg === "string" ? errMsg :
            `This promise timed out after waiting ${timeoutDelay}s for the original promise.`);
        Object.defineProperty(timeoutErr, "name", { value: "TimeoutError" });
        Error.captureStackTrace(timeoutErr, create_timeout_promise);

        return new Promise((resolve, reject) => {
            let pending = true;

            let timeoutID = setTimeout(() => {
                if (pending) {
                    pending = false;
                    clearTimeout(timeoutID);
                    reject(timeoutErr);
                }
            }, 1e3 * timeoutDelay);

            origPromise.then((result) => {
                if (pending) {
                    pending = false;
                    clearTimeout(timeoutID);
                    resolve(result);
                }
            }).catch((err) => {
                if (pending) {
                    pending = false;
                    clearTimeout(timeoutID);
                    reject(err);
                }
            });
        });
    } // create_timeout_promise

    /** @type {InmemoryAdapter} */
    const inmemory_adapter = Object.freeze({

        "CREATE": (subject, timeout) => !timeout ? operation_inmemory_create(subject)
            : create_timeout_promise(operation_inmemory_create(subject), timeout),

        "READ": (subject, key, timeout) => !timeout ? operation_inmemory_read(subject, key)
            : create_timeout_promise(operation_inmemory_read(subject, key), timeout),

        "UPDATE": (subject, key, value, timeout) => !timeout ? operation_inmemory_update(subject, key, value)
            : create_timeout_promise(operation_inmemory_update(subject, key, value), timeout),

        "DELETE": (subject, predicate, object, timeout) => !timeout ? operation_inmemory_delete(subject, predicate, object)
            : create_timeout_promise(operation_inmemory_delete(subject, predicate, object), timeout),

        "LIST": (subject, predicate, timeout) => !timeout ? operation_inmemory_list(subject, predicate)
            : create_timeout_promise(operation_inmemory_list(subject, predicate), timeout),

    }); // inmemory_adapter

    return inmemory_adapter;

}; // module.exports