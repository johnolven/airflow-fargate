"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const ecs = require("@aws-cdk/aws-ecs");
const aws_ecr_assets_1 = require("@aws-cdk/aws-ecr-assets");
const aws_ecs_1 = require("@aws-cdk/aws-ecs");
const config_1 = require("../config");
const service_construct_1 = require("./service-construct");
const uuid_1 = require("uuid");
class AirflowConstruct extends core_1.Construct {
    constructor(parent, name, props) {
        super(parent, name);
        const adminPassword = uuid_1.v4();
        const ENV_VAR = {
            AIRFLOW__CORE__SQL_ALCHEMY_CONN: props.dbConnection,
            AIRFLOW__CELERY__BROKER_URL: "sqs://",
            AIRFLOW__CELERY__RESULT_BACKEND: "db+" + props.dbConnection,
            AIRFLOW__CORE__EXECUTOR: "CeleryExecutor",
            AIRFLOW__WEBSERVER__RBAC: "True",
            ADMIN_PASS: adminPassword,
            CLUSTER: props.cluster.clusterName,
            SECURITY_GROUP: props.defaultVpcSecurityGroup.securityGroupId,
            SUBNETS: props.privateSubnets.map(subnet => subnet.subnetId).join(",")
        };
        const logging = new ecs.AwsLogDriver({
            streamPrefix: 'FarFlowLogging',
            logRetention: config_1.airflowTaskConfig.logRetention
        });
        // Build Airflow docker image from Dockerfile
        const airflowImageAsset = new aws_ecr_assets_1.DockerImageAsset(this, 'AirflowBuildImage', {
            directory: './airflow',
        });
        const airflowTask = new aws_ecs_1.FargateTaskDefinition(this, 'AirflowTask', {
            cpu: config_1.airflowTaskConfig.cpu,
            memoryLimitMiB: config_1.airflowTaskConfig.memoryLimitMiB
        });
        let workerTask = airflowTask;
        if (config_1.airflowTaskConfig.createWorkerPool) {
            workerTask = new aws_ecs_1.FargateTaskDefinition(this, 'WorkerTask', {
                cpu: config_1.airflowTaskConfig.cpu,
                memoryLimitMiB: config_1.airflowTaskConfig.memoryLimitMiB
            });
        }
        let mmap = new Map();
        mmap.set(config_1.airflowTaskConfig.webserverConfig, airflowTask);
        mmap.set(config_1.airflowTaskConfig.schedulerConfig, airflowTask);
        mmap.set(config_1.airflowTaskConfig.workerConfig, workerTask);
        // Add containers to corresponding Tasks
        for (let entry of mmap.entries()) {
            let containerInfo = entry[0];
            let task = entry[1];
            task.addContainer(containerInfo.name, {
                image: ecs.ContainerImage.fromDockerImageAsset(airflowImageAsset),
                logging: logging,
                environment: ENV_VAR,
                entryPoint: [containerInfo.entryPoint],
                cpu: containerInfo.cpu,
                memoryLimitMiB: containerInfo.cpu
            }).addPortMappings({
                containerPort: containerInfo.containerPort
            });
        }
        new service_construct_1.ServiceConstruct(this, "AirflowService", {
            cluster: props.cluster,
            defaultVpcSecurityGroup: props.defaultVpcSecurityGroup,
            vpc: props.vpc,
            taskDefinition: airflowTask,
            isWorkerService: false
        });
        if (config_1.airflowTaskConfig.createWorkerPool) {
            new service_construct_1.ServiceConstruct(this, "WorkerService", {
                cluster: props.cluster,
                defaultVpcSecurityGroup: props.defaultVpcSecurityGroup,
                vpc: props.vpc,
                taskDefinition: workerTask,
                isWorkerService: true
            });
        }
        this.adminPasswordOutput = new core_1.CfnOutput(this, 'AdminPassword', {
            value: adminPassword
        });
    }
}
exports.AirflowConstruct = AirflowConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWlyZmxvdy1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhaXJmbG93LWNvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUFtRDtBQUduRCx3Q0FBeUM7QUFFekMsNERBQTJEO0FBQzNELDhDQUF5RDtBQUV6RCxzQ0FBNkQ7QUFDN0QsMkRBQXVEO0FBQ3ZELCtCQUFvQztBQVdwQyxNQUFhLGdCQUFpQixTQUFRLGdCQUFTO0lBRzdDLFlBQVksTUFBaUIsRUFBRSxJQUFZLEVBQUUsS0FBNEI7UUFDdkUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVwQixNQUFNLGFBQWEsR0FBRyxTQUFNLEVBQUUsQ0FBQztRQUUvQixNQUFNLE9BQU8sR0FBRztZQUNkLCtCQUErQixFQUFFLEtBQUssQ0FBQyxZQUFZO1lBQ25ELDJCQUEyQixFQUFFLFFBQVE7WUFDckMsK0JBQStCLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxZQUFZO1lBQzNELHVCQUF1QixFQUFFLGdCQUFnQjtZQUN6Qyx3QkFBd0IsRUFBRSxNQUFNO1lBQ2hDLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbEMsY0FBYyxFQUFFLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlO1lBQzdELE9BQU8sRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ3ZFLENBQUM7UUFFRixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDbkMsWUFBWSxFQUFFLGdCQUFnQjtZQUM5QixZQUFZLEVBQUUsMEJBQWlCLENBQUMsWUFBWTtTQUM3QyxDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGlDQUFnQixDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN4RSxTQUFTLEVBQUUsV0FBVztTQUN2QixDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsR0FBRyxJQUFJLCtCQUFxQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDakUsR0FBRyxFQUFFLDBCQUFpQixDQUFDLEdBQUc7WUFDMUIsY0FBYyxFQUFFLDBCQUFpQixDQUFDLGNBQWM7U0FDakQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDO1FBQzdCLElBQUksMEJBQWlCLENBQUMsZ0JBQWdCLEVBQUU7WUFDdEMsVUFBVSxHQUFHLElBQUksK0JBQXFCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtnQkFDekQsR0FBRyxFQUFFLDBCQUFpQixDQUFDLEdBQUc7Z0JBQzFCLGNBQWMsRUFBRSwwQkFBaUIsQ0FBQyxjQUFjO2FBQ2pELENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUFpQixDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUFpQixDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUFpQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVyRCx3Q0FBd0M7UUFDeEMsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxhQUFhLEdBQW9CLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLElBQUksR0FBMEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTNDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRTtnQkFDcEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUM7Z0JBQ2pFLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixXQUFXLEVBQUUsT0FBTztnQkFDcEIsVUFBVSxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztnQkFDdEMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUFHO2dCQUN0QixjQUFjLEVBQUUsYUFBYSxDQUFDLEdBQUc7YUFDbEMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztnQkFDakIsYUFBYSxFQUFFLGFBQWEsQ0FBQyxhQUFhO2FBQzNDLENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxvQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDM0MsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQ3RCLHVCQUF1QixFQUFFLEtBQUssQ0FBQyx1QkFBdUI7WUFDdEQsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsY0FBYyxFQUFFLFdBQVc7WUFDM0IsZUFBZSxFQUFFLEtBQUs7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSwwQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRTtZQUN0QyxJQUFJLG9DQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7Z0JBQzFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLHVCQUF1QjtnQkFDdEQsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO2dCQUNkLGNBQWMsRUFBRSxVQUFVO2dCQUMxQixlQUFlLEVBQUUsSUFBSTthQUN0QixDQUFDLENBQUM7U0FDSjtRQUVELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLGdCQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUM5RCxLQUFLLEVBQUUsYUFBYTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF2RkQsNENBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDZm5PdXRwdXQsIENvbnN0cnVjdH0gZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCB7IElWcGMgfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuXG5pbXBvcnQgZWNzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVjcycpO1xuaW1wb3J0IGVjMiA9IHJlcXVpcmUoXCJAYXdzLWNkay9hd3MtZWMyXCIpO1xuaW1wb3J0IHsgRG9ja2VySW1hZ2VBc3NldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1lY3ItYXNzZXRzJztcbmltcG9ydCB7IEZhcmdhdGVUYXNrRGVmaW5pdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1lY3MnO1xuXG5pbXBvcnQge2FpcmZsb3dUYXNrQ29uZmlnLCBDb250YWluZXJDb25maWd9IGZyb20gXCIuLi9jb25maWdcIjtcbmltcG9ydCB7IFNlcnZpY2VDb25zdHJ1Y3QgfSBmcm9tIFwiLi9zZXJ2aWNlLWNvbnN0cnVjdFwiO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBBaXJmbG93Q29uc3RydWN0UHJvcHMge1xuICByZWFkb25seSB2cGM6IElWcGM7XG4gIHJlYWRvbmx5IGNsdXN0ZXI6IGVjcy5JQ2x1c3RlcjtcbiAgcmVhZG9ubHkgZGJDb25uZWN0aW9uOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGRlZmF1bHRWcGNTZWN1cml0eUdyb3VwOiBlYzIuSVNlY3VyaXR5R3JvdXA7XG4gIHJlYWRvbmx5IHByaXZhdGVTdWJuZXRzOiBlYzIuSVN1Ym5ldFtdO1xufVxuXG5leHBvcnQgY2xhc3MgQWlyZmxvd0NvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBhZG1pblBhc3N3b3JkT3V0cHV0PzogQ2ZuT3V0cHV0O1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudDogQ29uc3RydWN0LCBuYW1lOiBzdHJpbmcsIHByb3BzOiBBaXJmbG93Q29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihwYXJlbnQsIG5hbWUpO1xuXG4gICAgY29uc3QgYWRtaW5QYXNzd29yZCA9IHV1aWR2NCgpO1xuXG4gICAgY29uc3QgRU5WX1ZBUiA9IHtcbiAgICAgIEFJUkZMT1dfX0NPUkVfX1NRTF9BTENIRU1ZX0NPTk46IHByb3BzLmRiQ29ubmVjdGlvbixcbiAgICAgIEFJUkZMT1dfX0NFTEVSWV9fQlJPS0VSX1VSTDogXCJzcXM6Ly9cIixcbiAgICAgIEFJUkZMT1dfX0NFTEVSWV9fUkVTVUxUX0JBQ0tFTkQ6IFwiZGIrXCIgKyBwcm9wcy5kYkNvbm5lY3Rpb24sXG4gICAgICBBSVJGTE9XX19DT1JFX19FWEVDVVRPUjogXCJDZWxlcnlFeGVjdXRvclwiLFxuICAgICAgQUlSRkxPV19fV0VCU0VSVkVSX19SQkFDOiBcIlRydWVcIixcbiAgICAgIEFETUlOX1BBU1M6IGFkbWluUGFzc3dvcmQsXG4gICAgICBDTFVTVEVSOiBwcm9wcy5jbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgU0VDVVJJVFlfR1JPVVA6IHByb3BzLmRlZmF1bHRWcGNTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCxcbiAgICAgIFNVQk5FVFM6IHByb3BzLnByaXZhdGVTdWJuZXRzLm1hcChzdWJuZXQgPT4gc3VibmV0LnN1Ym5ldElkKS5qb2luKFwiLFwiKVxuICAgIH07XG5cbiAgICBjb25zdCBsb2dnaW5nID0gbmV3IGVjcy5Bd3NMb2dEcml2ZXIoe1xuICAgICAgc3RyZWFtUHJlZml4OiAnRmFyRmxvd0xvZ2dpbmcnLFxuICAgICAgbG9nUmV0ZW50aW9uOiBhaXJmbG93VGFza0NvbmZpZy5sb2dSZXRlbnRpb25cbiAgICB9KTtcblxuICAgIC8vIEJ1aWxkIEFpcmZsb3cgZG9ja2VyIGltYWdlIGZyb20gRG9ja2VyZmlsZVxuICAgIGNvbnN0IGFpcmZsb3dJbWFnZUFzc2V0ID0gbmV3IERvY2tlckltYWdlQXNzZXQodGhpcywgJ0FpcmZsb3dCdWlsZEltYWdlJywge1xuICAgICAgZGlyZWN0b3J5OiAnLi9haXJmbG93JyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFpcmZsb3dUYXNrID0gbmV3IEZhcmdhdGVUYXNrRGVmaW5pdGlvbih0aGlzLCAnQWlyZmxvd1Rhc2snLCB7XG4gICAgICBjcHU6IGFpcmZsb3dUYXNrQ29uZmlnLmNwdSxcbiAgICAgIG1lbW9yeUxpbWl0TWlCOiBhaXJmbG93VGFza0NvbmZpZy5tZW1vcnlMaW1pdE1pQlxuICAgIH0pO1xuXG4gICAgbGV0IHdvcmtlclRhc2sgPSBhaXJmbG93VGFzaztcbiAgICBpZiAoYWlyZmxvd1Rhc2tDb25maWcuY3JlYXRlV29ya2VyUG9vbCkge1xuICAgICAgd29ya2VyVGFzayA9IG5ldyBGYXJnYXRlVGFza0RlZmluaXRpb24odGhpcywgJ1dvcmtlclRhc2snLCB7XG4gICAgICAgIGNwdTogYWlyZmxvd1Rhc2tDb25maWcuY3B1LFxuICAgICAgICBtZW1vcnlMaW1pdE1pQjogYWlyZmxvd1Rhc2tDb25maWcubWVtb3J5TGltaXRNaUJcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBtbWFwID0gbmV3IE1hcCgpO1xuICAgIG1tYXAuc2V0KGFpcmZsb3dUYXNrQ29uZmlnLndlYnNlcnZlckNvbmZpZywgYWlyZmxvd1Rhc2spO1xuICAgIG1tYXAuc2V0KGFpcmZsb3dUYXNrQ29uZmlnLnNjaGVkdWxlckNvbmZpZywgYWlyZmxvd1Rhc2spO1xuICAgIG1tYXAuc2V0KGFpcmZsb3dUYXNrQ29uZmlnLndvcmtlckNvbmZpZywgd29ya2VyVGFzayk7XG5cbiAgICAvLyBBZGQgY29udGFpbmVycyB0byBjb3JyZXNwb25kaW5nIFRhc2tzXG4gICAgZm9yIChsZXQgZW50cnkgb2YgbW1hcC5lbnRyaWVzKCkpIHtcbiAgICAgIGxldCBjb250YWluZXJJbmZvOiBDb250YWluZXJDb25maWcgPSBlbnRyeVswXTtcbiAgICAgIGxldCB0YXNrOiBGYXJnYXRlVGFza0RlZmluaXRpb24gPSBlbnRyeVsxXTtcblxuICAgICAgdGFzay5hZGRDb250YWluZXIoY29udGFpbmVySW5mby5uYW1lLCB7XG4gICAgICAgIGltYWdlOiBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbURvY2tlckltYWdlQXNzZXQoYWlyZmxvd0ltYWdlQXNzZXQpLFxuICAgICAgICBsb2dnaW5nOiBsb2dnaW5nLFxuICAgICAgICBlbnZpcm9ubWVudDogRU5WX1ZBUixcbiAgICAgICAgZW50cnlQb2ludDogW2NvbnRhaW5lckluZm8uZW50cnlQb2ludF0sXG4gICAgICAgIGNwdTogY29udGFpbmVySW5mby5jcHUsXG4gICAgICAgIG1lbW9yeUxpbWl0TWlCOiBjb250YWluZXJJbmZvLmNwdVxuICAgICAgfSkuYWRkUG9ydE1hcHBpbmdzKHtcbiAgICAgICAgY29udGFpbmVyUG9ydDogY29udGFpbmVySW5mby5jb250YWluZXJQb3J0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBuZXcgU2VydmljZUNvbnN0cnVjdCh0aGlzLCBcIkFpcmZsb3dTZXJ2aWNlXCIsIHtcbiAgICAgIGNsdXN0ZXI6IHByb3BzLmNsdXN0ZXIsXG4gICAgICBkZWZhdWx0VnBjU2VjdXJpdHlHcm91cDogcHJvcHMuZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXAsXG4gICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgIHRhc2tEZWZpbml0aW9uOiBhaXJmbG93VGFzayxcbiAgICAgIGlzV29ya2VyU2VydmljZTogZmFsc2VcbiAgICB9KTtcblxuICAgIGlmIChhaXJmbG93VGFza0NvbmZpZy5jcmVhdGVXb3JrZXJQb29sKSB7XG4gICAgICBuZXcgU2VydmljZUNvbnN0cnVjdCh0aGlzLCBcIldvcmtlclNlcnZpY2VcIiwge1xuICAgICAgICBjbHVzdGVyOiBwcm9wcy5jbHVzdGVyLFxuICAgICAgICBkZWZhdWx0VnBjU2VjdXJpdHlHcm91cDogcHJvcHMuZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXAsXG4gICAgICAgIHZwYzogcHJvcHMudnBjLFxuICAgICAgICB0YXNrRGVmaW5pdGlvbjogd29ya2VyVGFzayxcbiAgICAgICAgaXNXb3JrZXJTZXJ2aWNlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmFkbWluUGFzc3dvcmRPdXRwdXQgPSBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdBZG1pblBhc3N3b3JkJywge1xuICAgICAgdmFsdWU6IGFkbWluUGFzc3dvcmRcbiAgICB9KTtcbiAgfVxufVxuIl19