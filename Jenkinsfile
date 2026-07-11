pipeline {
    agent any

    environment {
        AWS_REGION = "ap-southeast-1"
        ACCOUNT_ID = "646724772680"
        ECR_REPO = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/node-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE = "${ECR_REPO}:${IMAGE_TAG}"
    }

    stages {

        stage('Install Dependencies') {
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
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-creds'
                    ]
                ]) {
                    sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    '''
                }
            }
        }

        stage('Tag Docker Image') {
            steps {
                sh '''
                docker tag node-app:${BUILD_NUMBER} ${IMAGE}
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                docker push ${IMAGE}
                '''
            }
        }

        stage('Update Kubernetes YAML') {
            steps {
                sh '''
                sed -i "s|image:.*|image: ${IMAGE}|" deployment.yaml
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                sudo -n -u ec2-user /usr/local/bin/kubectl apply -f deployment.yaml
                sudo -n -u ec2-user /usr/local/bin/kubectl apply -f service.yaml
                sudo -n -u ec2-user /usr/local/bin/kubectl rollout restart deployment/node-app
                sudo -n -u ec2-user /usr/local/bin/kubectl rollout status deployment/node-app
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                sudo -n -u ec2-user /usr/local/bin/kubectl get deployment
                sudo -n -u ec2-user /usr/local/bin/kubectl get pods
                sudo -n -u ec2-user /usr/local/bin/kubectl get svc
                '''
            }
        }
    }

    post {

        success {
            echo "Build #${BUILD_NUMBER} completed successfully."
        }

        failure {
            echo "Pipeline failed."
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
