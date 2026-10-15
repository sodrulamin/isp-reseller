pipeline {
    agent any

    environment {
        JAVA_HOME = tool name: 'Java-21', type: 'jdk'
        MAVEN_HOME = tool name: 'Maven-3.9', type: 'maven'
        PATH = "${JAVA_HOME}/bin:${MAVEN_HOME}/bin:${env.PATH}"
        DOCKER_IMAGE_BACKEND = "isp-reseller-backend:${BUILD_NUMBER}"
        DOCKER_IMAGE_FRONTEND = "isp-reseller-frontend:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        stage('Build & Test Backend') {
            steps {
                echo 'Compiling Spring Boot 4.1.1 backend and running tests...'
                dir('backend') {
                    sh 'mvn clean package -DskipTests=false'
                }
            }
        }

        stage('Build Frontend Assets') {
            steps {
                echo 'Building React production assets...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building multi-stage Docker images...'
                sh "docker build -t ${DOCKER_IMAGE_BACKEND} -f Dockerfile.backend ."
                sh "docker build -t ${DOCKER_IMAGE_FRONTEND} -f Dockerfile.frontend ."
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo 'Deploying ISP Reseller Billing SaaS containers...'
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verifying deployment health...'
                sleep time: 15, unit: 'SECONDS'
                sh 'curl -f http://localhost:8080/api/health || exit 1'
            }
        }
    }

    post {
        success {
            echo "Deployment of ISP Billing SaaS completed successfully on build ${BUILD_NUMBER}!"
        }
        failure {
            echo "Pipeline failed on build ${BUILD_NUMBER}. Please check console logs."
        }
        always {
            cleanWs deleteDirs: true, notFailBuild: true
        }
    }
}
