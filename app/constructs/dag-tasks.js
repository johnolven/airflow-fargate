"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const aws_ecs_1 = require("@aws-cdk/aws-ecs");
const aws_logs_1 = require("@aws-cdk/aws-logs");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
const efs = require("@aws-cdk/aws-efs");
const aws_logs_2 = require("@aws-cdk/aws-logs");
const task_construct_1 = require("./task-construct");
class DagTasks extends core_1.Construct {
    constructor(scope, taskName, props) {
        super(scope, taskName + "-TaskConstruct");
        const logging = new aws_ecs_1.AwsLogDriver({
            streamPrefix: 'FarFlowDagTaskLogging',
            logGroup: new aws_logs_2.LogGroup(scope, "FarFlowDagTaskLogs", {
                logGroupName: "FarFlowDagTaskLogs",
                retention: aws_logs_1.RetentionDays.ONE_MONTH
            })
        });
        let sharedFS = new efs.FileSystem(this, 'EFSVolume', {
            vpc: props.vpc,
            securityGroup: props.defaultVpcSecurityGroup
        });
        sharedFS.connections.allowInternally(aws_ec2_1.Port.tcp(2049));
        let efsVolumeInfo = {
            containerPath: "/shared-volume",
            volumeName: "SharedVolume",
            efsFileSystemId: sharedFS.fileSystemId
        };
        // Task Container with multiple python executables
        new task_construct_1.AirflowDagTaskDefinition(this, 'FarFlowCombinedTask', {
            containerInfo: {
                assetDir: "./tasks/multi_task",
                name: "MultiTaskContainer"
            },
            cpu: 512,
            memoryLimitMiB: 1024,
            taskFamilyName: "FarFlowCombinedTask",
            logging: logging,
            efsVolumeInfo: efsVolumeInfo
        });
        // Task Container with single python executable
        new task_construct_1.AirflowDagTaskDefinition(this, 'FarFlowNumbersTask', {
            containerInfo: {
                assetDir: "./tasks/number_task",
                name: "NumbersContainer"
            },
            cpu: 256,
            memoryLimitMiB: 512,
            taskFamilyName: "FarFlowNumbersTask",
            logging: logging,
            efsVolumeInfo: efsVolumeInfo
        });
    }
}
exports.DagTasks = DagTasks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFnLXRhc2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGFnLXRhc2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQTBDO0FBQzFDLDhDQUFnRDtBQUNoRCxnREFBa0Q7QUFDbEQsOENBQTREO0FBQzVELHdDQUF5QztBQUN6QyxnREFBNkM7QUFFN0MscURBQTBFO0FBTzFFLE1BQWEsUUFBUyxTQUFRLGdCQUFTO0lBRXJDLFlBQ0UsS0FBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsS0FBb0I7UUFFcEIsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztRQUUxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLHNCQUFZLENBQUM7WUFDL0IsWUFBWSxFQUFFLHVCQUF1QjtZQUNyQyxRQUFRLEVBQUUsSUFBSSxtQkFBUSxDQUFDLEtBQUssRUFBRSxvQkFBb0IsRUFBRTtnQkFDbEQsWUFBWSxFQUFFLG9CQUFvQjtnQkFDbEMsU0FBUyxFQUFFLHdCQUFhLENBQUMsU0FBUzthQUNuQyxDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDbkQsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsYUFBYSxFQUFFLEtBQUssQ0FBQyx1QkFBdUI7U0FDN0MsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksYUFBYSxHQUFrQjtZQUNqQyxhQUFhLEVBQUUsZ0JBQWdCO1lBQy9CLFVBQVUsRUFBRSxjQUFjO1lBQzFCLGVBQWUsRUFBRSxRQUFRLENBQUMsWUFBWTtTQUN2QyxDQUFBO1FBRUQsa0RBQWtEO1FBQ2xELElBQUkseUNBQXdCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ3hELGFBQWEsRUFBRTtnQkFDYixRQUFRLEVBQUUsb0JBQW9CO2dCQUM5QixJQUFJLEVBQUUsb0JBQW9CO2FBQzNCO1lBQ0QsR0FBRyxFQUFFLEdBQUc7WUFDUixjQUFjLEVBQUUsSUFBSTtZQUNwQixjQUFjLEVBQUUscUJBQXFCO1lBQ3JDLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGFBQWEsRUFBRSxhQUFhO1NBQzdCLENBQUMsQ0FBQztRQUVILCtDQUErQztRQUMvQyxJQUFJLHlDQUF3QixDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUN2RCxhQUFhLEVBQUU7Z0JBQ2IsUUFBUSxFQUFFLHFCQUFxQjtnQkFDL0IsSUFBSSxFQUFFLGtCQUFrQjthQUN6QjtZQUNELEdBQUcsRUFBRSxHQUFHO1lBQ1IsY0FBYyxFQUFFLEdBQUc7WUFDbkIsY0FBYyxFQUFFLG9CQUFvQjtZQUNwQyxPQUFPLEVBQUUsT0FBTztZQUNoQixhQUFhLEVBQUUsYUFBYTtTQUM3QixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF2REQsNEJBdURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcIkBhd3MtY2RrL2NvcmVcIjtcbmltcG9ydCB7QXdzTG9nRHJpdmVyLCB9IGZyb20gXCJAYXdzLWNkay9hd3MtZWNzXCI7XG5pbXBvcnQgeyBSZXRlbnRpb25EYXlzIH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1sb2dzXCI7XG5pbXBvcnQge0lWcGMsIElTZWN1cml0eUdyb3VwLCBQb3J0fSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuaW1wb3J0IGVmcyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1lZnMnKTtcbmltcG9ydCB7IExvZ0dyb3VwIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWxvZ3MnO1xuXG5pbXBvcnQgeyBBaXJmbG93RGFnVGFza0RlZmluaXRpb24sIEVmc1ZvbHVtZUluZm8gfSBmcm9tIFwiLi90YXNrLWNvbnN0cnVjdFwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGFnVGFza3NQcm9wcyB7XG4gIHJlYWRvbmx5IHZwYzogSVZwYztcbiAgcmVhZG9ubHkgZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXA6IElTZWN1cml0eUdyb3VwO1xufVxuXG5leHBvcnQgY2xhc3MgRGFnVGFza3MgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNjb3BlOiBDb25zdHJ1Y3QsXG4gICAgdGFza05hbWU6IHN0cmluZyxcbiAgICBwcm9wczogRGFnVGFza3NQcm9wc1xuICApIHtcbiAgICBzdXBlcihzY29wZSwgdGFza05hbWUgKyBcIi1UYXNrQ29uc3RydWN0XCIpO1xuXG4gICAgY29uc3QgbG9nZ2luZyA9IG5ldyBBd3NMb2dEcml2ZXIoeyBcbiAgICAgIHN0cmVhbVByZWZpeDogJ0ZhckZsb3dEYWdUYXNrTG9nZ2luZycsXG4gICAgICBsb2dHcm91cDogbmV3IExvZ0dyb3VwKHNjb3BlLCBcIkZhckZsb3dEYWdUYXNrTG9nc1wiLCB7XG4gICAgICAgIGxvZ0dyb3VwTmFtZTogXCJGYXJGbG93RGFnVGFza0xvZ3NcIixcbiAgICAgICAgcmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLk9ORV9NT05USFxuICAgICAgfSlcbiAgICB9KTtcblxuICAgIGxldCBzaGFyZWRGUyA9IG5ldyBlZnMuRmlsZVN5c3RlbSh0aGlzLCAnRUZTVm9sdW1lJywge1xuICAgICAgdnBjOiBwcm9wcy52cGMsXG4gICAgICBzZWN1cml0eUdyb3VwOiBwcm9wcy5kZWZhdWx0VnBjU2VjdXJpdHlHcm91cFxuICAgIH0pO1xuICAgIHNoYXJlZEZTLmNvbm5lY3Rpb25zLmFsbG93SW50ZXJuYWxseShQb3J0LnRjcCgyMDQ5KSk7XG5cbiAgICBsZXQgZWZzVm9sdW1lSW5mbzogRWZzVm9sdW1lSW5mbyA9IHtcbiAgICAgIGNvbnRhaW5lclBhdGg6IFwiL3NoYXJlZC12b2x1bWVcIixcbiAgICAgIHZvbHVtZU5hbWU6IFwiU2hhcmVkVm9sdW1lXCIsXG4gICAgICBlZnNGaWxlU3lzdGVtSWQ6IHNoYXJlZEZTLmZpbGVTeXN0ZW1JZFxuICAgIH1cblxuICAgIC8vIFRhc2sgQ29udGFpbmVyIHdpdGggbXVsdGlwbGUgcHl0aG9uIGV4ZWN1dGFibGVzXG4gICAgbmV3IEFpcmZsb3dEYWdUYXNrRGVmaW5pdGlvbih0aGlzLCAnRmFyRmxvd0NvbWJpbmVkVGFzaycsIHtcbiAgICAgIGNvbnRhaW5lckluZm86IHtcbiAgICAgICAgYXNzZXREaXI6IFwiLi90YXNrcy9tdWx0aV90YXNrXCIsXG4gICAgICAgIG5hbWU6IFwiTXVsdGlUYXNrQ29udGFpbmVyXCJcbiAgICAgIH0sXG4gICAgICBjcHU6IDUxMixcbiAgICAgIG1lbW9yeUxpbWl0TWlCOiAxMDI0LFxuICAgICAgdGFza0ZhbWlseU5hbWU6IFwiRmFyRmxvd0NvbWJpbmVkVGFza1wiLFxuICAgICAgbG9nZ2luZzogbG9nZ2luZyxcbiAgICAgIGVmc1ZvbHVtZUluZm86IGVmc1ZvbHVtZUluZm9cbiAgICB9KTtcblxuICAgIC8vIFRhc2sgQ29udGFpbmVyIHdpdGggc2luZ2xlIHB5dGhvbiBleGVjdXRhYmxlXG4gICAgbmV3IEFpcmZsb3dEYWdUYXNrRGVmaW5pdGlvbih0aGlzLCAnRmFyRmxvd051bWJlcnNUYXNrJywge1xuICAgICAgY29udGFpbmVySW5mbzoge1xuICAgICAgICBhc3NldERpcjogXCIuL3Rhc2tzL251bWJlcl90YXNrXCIsXG4gICAgICAgIG5hbWU6IFwiTnVtYmVyc0NvbnRhaW5lclwiXG4gICAgICB9LFxuICAgICAgY3B1OiAyNTYsXG4gICAgICBtZW1vcnlMaW1pdE1pQjogNTEyLFxuICAgICAgdGFza0ZhbWlseU5hbWU6IFwiRmFyRmxvd051bWJlcnNUYXNrXCIsXG4gICAgICBsb2dnaW5nOiBsb2dnaW5nLFxuICAgICAgZWZzVm9sdW1lSW5mbzogZWZzVm9sdW1lSW5mb1xuICAgIH0pO1xuICB9XG59XG4iXX0=