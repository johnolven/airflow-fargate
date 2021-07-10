"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const ecs = require("@aws-cdk/aws-ecs");
const aws_ecr_assets_1 = require("@aws-cdk/aws-ecr-assets");
const aws_ecs_1 = require("@aws-cdk/aws-ecs");
const aws_iam_1 = require("@aws-cdk/aws-iam");
class AirflowDagTaskDefinition extends core_1.Construct {
    constructor(scope, taskName, props) {
        super(scope, taskName + "-TaskConstruct");
        // Create a new task with given requirements
        const workerTask = new aws_ecs_1.FargateTaskDefinition(this, taskName + '-TaskDef', {
            cpu: props.cpu,
            memoryLimitMiB: props.memoryLimitMiB,
            family: props.taskFamilyName
        });
        if (props.efsVolumeInfo) {
            workerTask.addVolume({
                name: props.efsVolumeInfo.volumeName,
                efsVolumeConfiguration: {
                    fileSystemId: props.efsVolumeInfo.efsFileSystemId
                }
            });
            workerTask.taskRole.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AmazonElasticFileSystemClientReadWriteAccess"));
        }
        const workerImageAsset = new aws_ecr_assets_1.DockerImageAsset(this, props.containerInfo.name + '-BuildImage', {
            directory: props.containerInfo.assetDir,
        });
        let container = workerTask.addContainer(props.containerInfo.name, {
            image: ecs.ContainerImage.fromDockerImageAsset(workerImageAsset),
            logging: props.logging
        });
        if (props.efsVolumeInfo) {
            container.addMountPoints({
                containerPath: props.efsVolumeInfo.containerPath,
                sourceVolume: props.efsVolumeInfo.volumeName,
                readOnly: false
            });
        }
    }
}
exports.AirflowDagTaskDefinition = AirflowDagTaskDefinition;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0YXNrLWNvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUEwQztBQUUxQyx3Q0FBeUM7QUFDekMsNERBQTJEO0FBQzNELDhDQUF5RDtBQUN6RCw4Q0FBK0M7QUFzQi9DLE1BQWEsd0JBQXlCLFNBQVEsZ0JBQVM7SUFFckQsWUFDRSxLQUFnQixFQUNoQixRQUFnQixFQUNoQixLQUFvQztRQUVwQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTFDLDRDQUE0QztRQUM1QyxNQUFNLFVBQVUsR0FBRyxJQUFJLCtCQUFxQixDQUFDLElBQUksRUFBRSxRQUFRLEdBQUcsVUFBVSxFQUFFO1lBQ3hFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztZQUNkLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYztZQUNwQyxNQUFNLEVBQUUsS0FBSyxDQUFDLGNBQWM7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLFVBQVUsQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLElBQUksRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVU7Z0JBQ3BDLHNCQUFzQixFQUFFO29CQUN0QixZQUFZLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxlQUFlO2lCQUNsRDthQUNGLENBQUMsQ0FBQztZQUVILFVBQVUsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7U0FDOUg7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksaUNBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLGFBQWEsRUFBRTtZQUM1RixTQUFTLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFRO1NBQ3hDLENBQUMsQ0FBQztRQUVILElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDaEUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUM7WUFDaEUsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1NBQ3ZCLENBQUMsQ0FBQztRQUVILElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRTtZQUN2QixTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUN2QixhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxhQUFhO2dCQUNoRCxZQUFZLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVO2dCQUM1QyxRQUFRLEVBQUUsS0FBSzthQUNoQixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FDRjtBQTVDRCw0REE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuXG5pbXBvcnQgZWNzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVjcycpO1xuaW1wb3J0IHsgRG9ja2VySW1hZ2VBc3NldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1lY3ItYXNzZXRzJztcbmltcG9ydCB7IEZhcmdhdGVUYXNrRGVmaW5pdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1lY3MnO1xuaW1wb3J0IHtNYW5hZ2VkUG9saWN5fSBmcm9tIFwiQGF3cy1jZGsvYXdzLWlhbVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFpcmZsb3dEYWdUYXNrRGVmaW5pdGlvblByb3BzIHtcbiAgcmVhZG9ubHkgdGFza0ZhbWlseU5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgY29udGFpbmVySW5mbzogQ29udGFpbmVySW5mbztcbiAgcmVhZG9ubHkgY3B1OiBudW1iZXI7XG4gIHJlYWRvbmx5IG1lbW9yeUxpbWl0TWlCOiBudW1iZXI7XG4gIHJlYWRvbmx5IGxvZ2dpbmc6IGVjcy5Mb2dEcml2ZXI7XG4gIHJlYWRvbmx5IGVmc1ZvbHVtZUluZm8/OiBFZnNWb2x1bWVJbmZvO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRhaW5lckluZm8ge1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFzc2V0RGlyOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWZzVm9sdW1lSW5mbyB7XG4gIHJlYWRvbmx5IHZvbHVtZU5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgZWZzRmlsZVN5c3RlbUlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGNvbnRhaW5lclBhdGg6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEFpcmZsb3dEYWdUYXNrRGVmaW5pdGlvbiBleHRlbmRzIENvbnN0cnVjdCB7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc2NvcGU6IENvbnN0cnVjdCxcbiAgICB0YXNrTmFtZTogc3RyaW5nLFxuICAgIHByb3BzOiBBaXJmbG93RGFnVGFza0RlZmluaXRpb25Qcm9wc1xuICApIHtcbiAgICBzdXBlcihzY29wZSwgdGFza05hbWUgKyBcIi1UYXNrQ29uc3RydWN0XCIpO1xuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IHRhc2sgd2l0aCBnaXZlbiByZXF1aXJlbWVudHNcbiAgICBjb25zdCB3b3JrZXJUYXNrID0gbmV3IEZhcmdhdGVUYXNrRGVmaW5pdGlvbih0aGlzLCB0YXNrTmFtZSArICctVGFza0RlZicsIHtcbiAgICAgIGNwdTogcHJvcHMuY3B1LFxuICAgICAgbWVtb3J5TGltaXRNaUI6IHByb3BzLm1lbW9yeUxpbWl0TWlCLFxuICAgICAgZmFtaWx5OiBwcm9wcy50YXNrRmFtaWx5TmFtZVxuICAgIH0pO1xuXG4gICAgaWYgKHByb3BzLmVmc1ZvbHVtZUluZm8pIHtcbiAgICAgIHdvcmtlclRhc2suYWRkVm9sdW1lKHtcbiAgICAgICAgbmFtZTogcHJvcHMuZWZzVm9sdW1lSW5mby52b2x1bWVOYW1lLFxuICAgICAgICBlZnNWb2x1bWVDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgZmlsZVN5c3RlbUlkOiBwcm9wcy5lZnNWb2x1bWVJbmZvLmVmc0ZpbGVTeXN0ZW1JZFxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgd29ya2VyVGFzay50YXNrUm9sZS5hZGRNYW5hZ2VkUG9saWN5KE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRWxhc3RpY0ZpbGVTeXN0ZW1DbGllbnRSZWFkV3JpdGVBY2Nlc3NcIikpO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtlckltYWdlQXNzZXQgPSBuZXcgRG9ja2VySW1hZ2VBc3NldCh0aGlzLCBwcm9wcy5jb250YWluZXJJbmZvLm5hbWUgKyAnLUJ1aWxkSW1hZ2UnLCB7XG4gICAgICBkaXJlY3Rvcnk6IHByb3BzLmNvbnRhaW5lckluZm8uYXNzZXREaXIsXG4gICAgfSk7XG5cbiAgICBsZXQgY29udGFpbmVyID0gd29ya2VyVGFzay5hZGRDb250YWluZXIocHJvcHMuY29udGFpbmVySW5mby5uYW1lLCB7XG4gICAgICBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21Eb2NrZXJJbWFnZUFzc2V0KHdvcmtlckltYWdlQXNzZXQpLFxuICAgICAgbG9nZ2luZzogcHJvcHMubG9nZ2luZ1xuICAgIH0pO1xuXG4gICAgaWYgKHByb3BzLmVmc1ZvbHVtZUluZm8pIHtcbiAgICAgIGNvbnRhaW5lci5hZGRNb3VudFBvaW50cyh7XG4gICAgICAgIGNvbnRhaW5lclBhdGg6IHByb3BzLmVmc1ZvbHVtZUluZm8uY29udGFpbmVyUGF0aCxcbiAgICAgICAgc291cmNlVm9sdW1lOiBwcm9wcy5lZnNWb2x1bWVJbmZvLnZvbHVtZU5hbWUsXG4gICAgICAgIHJlYWRPbmx5OiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=