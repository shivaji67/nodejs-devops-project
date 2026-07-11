pipeline {
    agent any

    environment {
        AWS_REGION = "ap-southeast-1"
        ECR_REPO = "646724772680.dkr.ecr.ap-southeast-1.amazonaws.com/node-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE = "${ECR_REPO}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/shivaji67/nodejs-devops-project.git'
            }
        }

        stage('Install Node Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t node-app:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-creds'
                ]]) {

                    sh '''
                    aws ecr get-login-password --region $AWS_REGION \
                    | docker login \
                    --username AWS \
                    --password-stdin 646724772680.dkr.ecr.ap-southeast-1.amazonaws.com
                    '''
                }
            }
        }

        stage('Tag Docker Image') {
            steps {
                sh '''
                docker tag node-app:${BUILD_NUMBER} $IMAGE
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                docker push $IMAGE
                '''
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {
                sh '''
                sed -i "s|image:.*|image: ${IMAGE}|" deployment.yaml
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                sudo -u ec2-user kubectl apply -f deployment.yaml
                sudo -u ec2-user kubectl apply -f service.yaml
                sudo -u ec2-user kubectl rollout restart deployment/node-app
                sudo -u ec2-user kubectl rollout status deployment/node-app
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                sudo -u ec2-user kubectl get pods
                sudo -u ec2-user kubectl get svc
                '''
            }
        }
    }

    post {

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
