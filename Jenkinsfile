node {
    nodejs(
        nodeJSInstallationName: 'NodeJS-14.15',
        configId: '3a2b029e-e312-4b8b-a5fc-4cbc73a9fd93'
    ) {

        stage('Build') {
            echo 'Building ...'
            checkout scm
            sh 'npm install'
        }

        stage('Test') {
            echo 'Testing ...'
            sh 'npm test'
        }

        stage('Deploy') {
            echo 'Deploying ...'
            sh 'npm publish'
        }

    }
}