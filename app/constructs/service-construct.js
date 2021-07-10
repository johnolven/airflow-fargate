"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const aws_ecs_1 = require("@aws-cdk/aws-ecs");
const policies_1 = require("../policies");
const config_1 = require("../config");
const ecs = require("@aws-cdk/aws-ecs");
const ec2 = require("@aws-cdk/aws-ec2");
const elbv2 = require("@aws-cdk/aws-elasticloadbalancingv2");
class ServiceConstruct extends core_1.Construct {
    constructor(parent, name, props) {
        super(parent, name);
        // Attach required policies to Task Role
        let policies = new policies_1.PolicyConstruct(this, "AIrflowTaskPolicies");
        if (policies.managedPolicies) {
            policies.managedPolicies.forEach(managedPolicy => props.taskDefinition.taskRole.addManagedPolicy(managedPolicy));
        }
        if (policies.policyStatements) {
            policies.policyStatements.forEach(policyStatement => props.taskDefinition.taskRole.addToPolicy(policyStatement));
        }
        // Create Fargate Service for Airflow
        this.fargateService = new ecs.FargateService(this, name, {
            cluster: props.cluster,
            taskDefinition: props.taskDefinition,
            securityGroup: props.defaultVpcSecurityGroup,
            platformVersion: aws_ecs_1.FargatePlatformVersion.VERSION1_4
        });
        const allowedPorts = new ec2.Port({
            protocol: ec2.Protocol.TCP,
            fromPort: 0,
            toPort: 65535,
            stringRepresentation: "All"
        });
        this.fargateService.connections.allowFromAnyIpv4(allowedPorts);
        if (props.isWorkerService) {
            this.configureAutoScaling();
        }
        else {
            // Export Load Balancer DNS Name, which will be used to access Airflow UI
            this.loadBalancerDnsName = new core_1.CfnOutput(this, 'LoadBalanceDNSName', {
                value: this.attachLoadBalancer(props.vpc),
            });
        }
    }
    attachLoadBalancer(vpc) {
        let loadBalancer = new elbv2.NetworkLoadBalancer(this, "NetworkLoadBalancer", {
            vpc: vpc,
            internetFacing: true,
            crossZoneEnabled: true
        });
        const listener = loadBalancer.addListener("Listener", {
            port: 80
        });
        const targetGroup = listener.addTargets("AirflowFargateServiceTargetGroup", {
            healthCheck: {
                port: "traffic-port",
                protocol: elbv2.Protocol.HTTP,
                path: "/health"
            },
            port: 80,
            targets: [this.fargateService]
        });
        targetGroup.setAttribute("deregistration_delay.timeout_seconds", "60");
        return loadBalancer.loadBalancerDnsName;
    }
    configureAutoScaling() {
        const scaling = this.fargateService.autoScaleTaskCount({
            maxCapacity: config_1.workerAutoScalingConfig.maxTaskCount,
            minCapacity: config_1.workerAutoScalingConfig.minTaskCount
        });
        if (config_1.workerAutoScalingConfig.cpuUsagePercent) {
            scaling.scaleOnCpuUtilization("CpuScaling", {
                targetUtilizationPercent: config_1.workerAutoScalingConfig.cpuUsagePercent,
                scaleInCooldown: core_1.Duration.seconds(60),
                scaleOutCooldown: core_1.Duration.seconds(60)
            });
        }
        if (config_1.workerAutoScalingConfig.memUsagePercent) {
            scaling.scaleOnMemoryUtilization("MemoryScaling", {
                targetUtilizationPercent: config_1.workerAutoScalingConfig.memUsagePercent,
                scaleInCooldown: core_1.Duration.seconds(60),
                scaleOutCooldown: core_1.Duration.seconds(60)
            });
        }
    }
}
exports.ServiceConstruct = ServiceConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXJ2aWNlLWNvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUE2RDtBQUU3RCw4Q0FBK0U7QUFFL0UsMENBQTRDO0FBQzVDLHNDQUFrRDtBQUNsRCx3Q0FBeUM7QUFDekMsd0NBQXlDO0FBQ3pDLDZEQUE4RDtBQVU5RCxNQUFhLGdCQUFpQixTQUFRLGdCQUFTO0lBSTdDLFlBQVksTUFBaUIsRUFBRSxJQUFZLEVBQUUsS0FBNEI7UUFDdkUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVwQix3Q0FBd0M7UUFDeEMsSUFBSSxRQUFRLEdBQUcsSUFBSSwwQkFBZSxDQUFDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hFLElBQUksUUFBUSxDQUFDLGVBQWUsRUFBRTtZQUM1QixRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDbEg7UUFDRCxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtZQUM3QixRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7U0FDbEg7UUFFRCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN2RCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87WUFDdEIsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjO1lBQ3BDLGFBQWEsRUFBRSxLQUFLLENBQUMsdUJBQXVCO1lBQzVDLGVBQWUsRUFBRSxnQ0FBc0IsQ0FBQyxVQUFVO1NBQ25ELENBQUMsQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQztZQUNoQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHO1lBQzFCLFFBQVEsRUFBRSxDQUFDO1lBQ1gsTUFBTSxFQUFFLEtBQUs7WUFDYixvQkFBb0IsRUFBRSxLQUFLO1NBQzVCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRS9ELElBQUksS0FBSyxDQUFDLGVBQWUsRUFBRTtZQUN6QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztTQUM3QjthQUNJO1lBQ0gseUVBQXlFO1lBQ3pFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLGdCQUFTLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO2dCQUNuRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsR0FBUztRQUNsQyxJQUFJLFlBQVksR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FDOUMsSUFBSSxFQUNKLHFCQUFxQixFQUNyQjtZQUNFLEdBQUcsRUFBRSxHQUFHO1lBQ1IsY0FBYyxFQUFFLElBQUk7WUFDcEIsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUNGLENBQUM7UUFFRixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRTtZQUNwRCxJQUFJLEVBQUUsRUFBRTtTQUNULENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQ3JDLGtDQUFrQyxFQUNsQztZQUNFLFdBQVcsRUFBRTtnQkFDWCxJQUFJLEVBQUUsY0FBYztnQkFDcEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDN0IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRCxJQUFJLEVBQUUsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7U0FDL0IsQ0FDRixDQUFDO1FBQ0YsV0FBVyxDQUFDLFlBQVksQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV2RSxPQUFPLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztJQUMxQyxDQUFDO0lBRU8sb0JBQW9CO1FBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUM7WUFDckQsV0FBVyxFQUFFLGdDQUF1QixDQUFDLFlBQVk7WUFDakQsV0FBVyxFQUFFLGdDQUF1QixDQUFDLFlBQVk7U0FDbEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxnQ0FBdUIsQ0FBQyxlQUFlLEVBQUU7WUFDM0MsT0FBTyxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRTtnQkFDMUMsd0JBQXdCLEVBQUUsZ0NBQXVCLENBQUMsZUFBZTtnQkFDakUsZUFBZSxFQUFFLGVBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxnQkFBZ0IsRUFBRSxlQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzthQUN2QyxDQUFDLENBQUM7U0FDSjtRQUVELElBQUksZ0NBQXVCLENBQUMsZUFBZSxFQUFFO1lBQzNDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUU7Z0JBQ2hELHdCQUF3QixFQUFFLGdDQUF1QixDQUFDLGVBQWU7Z0JBQ2pFLGVBQWUsRUFBRSxlQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsZ0JBQWdCLEVBQUUsZUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7YUFDdkMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0NBQ0Y7QUFoR0QsNENBZ0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDZm5PdXRwdXQsIENvbnN0cnVjdCwgRHVyYXRpb259IGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQge0lWcGN9IGZyb20gXCJAYXdzLWNkay9hd3MtZWMyXCI7XG5pbXBvcnQge0ZhcmdhdGVQbGF0Zm9ybVZlcnNpb24sIEZhcmdhdGVUYXNrRGVmaW5pdGlvbn0gZnJvbSAnQGF3cy1jZGsvYXdzLWVjcyc7XG5cbmltcG9ydCB7UG9saWN5Q29uc3RydWN0fSBmcm9tIFwiLi4vcG9saWNpZXNcIjtcbmltcG9ydCB7d29ya2VyQXV0b1NjYWxpbmdDb25maWd9IGZyb20gXCIuLi9jb25maWdcIjtcbmltcG9ydCBlY3MgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZWNzJyk7XG5pbXBvcnQgZWMyID0gcmVxdWlyZShcIkBhd3MtY2RrL2F3cy1lYzJcIik7XG5pbXBvcnQgZWxidjIgPSByZXF1aXJlKFwiQGF3cy1jZGsvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjJcIik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmljZUNvbnN0cnVjdFByb3BzIHtcbiAgcmVhZG9ubHkgdnBjOiBJVnBjO1xuICByZWFkb25seSBjbHVzdGVyOiBlY3MuSUNsdXN0ZXI7XG4gIHJlYWRvbmx5IGRlZmF1bHRWcGNTZWN1cml0eUdyb3VwOiBlYzIuSVNlY3VyaXR5R3JvdXA7XG4gIHJlYWRvbmx5IHRhc2tEZWZpbml0aW9uOiBGYXJnYXRlVGFza0RlZmluaXRpb247XG4gIHJlYWRvbmx5IGlzV29ya2VyU2VydmljZT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBmYXJnYXRlU2VydmljZTogZWNzLkZhcmdhdGVTZXJ2aWNlO1xuICBwdWJsaWMgcmVhZG9ubHkgbG9hZEJhbGFuY2VyRG5zTmFtZT86IENmbk91dHB1dDtcblxuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IENvbnN0cnVjdCwgbmFtZTogc3RyaW5nLCBwcm9wczogU2VydmljZUNvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIocGFyZW50LCBuYW1lKTtcblxuICAgIC8vIEF0dGFjaCByZXF1aXJlZCBwb2xpY2llcyB0byBUYXNrIFJvbGVcbiAgICBsZXQgcG9saWNpZXMgPSBuZXcgUG9saWN5Q29uc3RydWN0KHRoaXMsIFwiQUlyZmxvd1Rhc2tQb2xpY2llc1wiKTtcbiAgICBpZiAocG9saWNpZXMubWFuYWdlZFBvbGljaWVzKSB7XG4gICAgICBwb2xpY2llcy5tYW5hZ2VkUG9saWNpZXMuZm9yRWFjaChtYW5hZ2VkUG9saWN5ID0+IHByb3BzLnRhc2tEZWZpbml0aW9uLnRhc2tSb2xlLmFkZE1hbmFnZWRQb2xpY3kobWFuYWdlZFBvbGljeSkpO1xuICAgIH1cbiAgICBpZiAocG9saWNpZXMucG9saWN5U3RhdGVtZW50cykge1xuICAgICAgcG9saWNpZXMucG9saWN5U3RhdGVtZW50cy5mb3JFYWNoKHBvbGljeVN0YXRlbWVudCA9PiBwcm9wcy50YXNrRGVmaW5pdGlvbi50YXNrUm9sZS5hZGRUb1BvbGljeShwb2xpY3lTdGF0ZW1lbnQpKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgRmFyZ2F0ZSBTZXJ2aWNlIGZvciBBaXJmbG93XG4gICAgdGhpcy5mYXJnYXRlU2VydmljZSA9IG5ldyBlY3MuRmFyZ2F0ZVNlcnZpY2UodGhpcywgbmFtZSwge1xuICAgICAgY2x1c3RlcjogcHJvcHMuY2x1c3RlcixcbiAgICAgIHRhc2tEZWZpbml0aW9uOiBwcm9wcy50YXNrRGVmaW5pdGlvbixcbiAgICAgIHNlY3VyaXR5R3JvdXA6IHByb3BzLmRlZmF1bHRWcGNTZWN1cml0eUdyb3VwLFxuICAgICAgcGxhdGZvcm1WZXJzaW9uOiBGYXJnYXRlUGxhdGZvcm1WZXJzaW9uLlZFUlNJT04xXzRcbiAgICB9KTtcbiAgICBjb25zdCBhbGxvd2VkUG9ydHMgPSBuZXcgZWMyLlBvcnQoe1xuICAgICAgcHJvdG9jb2w6IGVjMi5Qcm90b2NvbC5UQ1AsXG4gICAgICBmcm9tUG9ydDogMCxcbiAgICAgIHRvUG9ydDogNjU1MzUsXG4gICAgICBzdHJpbmdSZXByZXNlbnRhdGlvbjogXCJBbGxcIlxuICAgIH0pO1xuICAgIHRoaXMuZmFyZ2F0ZVNlcnZpY2UuY29ubmVjdGlvbnMuYWxsb3dGcm9tQW55SXB2NChhbGxvd2VkUG9ydHMpO1xuXG4gICAgaWYgKHByb3BzLmlzV29ya2VyU2VydmljZSkge1xuICAgICAgdGhpcy5jb25maWd1cmVBdXRvU2NhbGluZygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEV4cG9ydCBMb2FkIEJhbGFuY2VyIEROUyBOYW1lLCB3aGljaCB3aWxsIGJlIHVzZWQgdG8gYWNjZXNzIEFpcmZsb3cgVUlcbiAgICAgIHRoaXMubG9hZEJhbGFuY2VyRG5zTmFtZSA9IG5ldyBDZm5PdXRwdXQodGhpcywgJ0xvYWRCYWxhbmNlRE5TTmFtZScsIHtcbiAgICAgICAgdmFsdWU6IHRoaXMuYXR0YWNoTG9hZEJhbGFuY2VyKHByb3BzLnZwYyksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaExvYWRCYWxhbmNlcih2cGM6IElWcGMpOiBzdHJpbmcge1xuICAgIGxldCBsb2FkQmFsYW5jZXIgPSBuZXcgZWxidjIuTmV0d29ya0xvYWRCYWxhbmNlcihcbiAgICAgIHRoaXMsXG4gICAgICBcIk5ldHdvcmtMb2FkQmFsYW5jZXJcIixcbiAgICAgIHtcbiAgICAgICAgdnBjOiB2cGMsXG4gICAgICAgIGludGVybmV0RmFjaW5nOiB0cnVlLFxuICAgICAgICBjcm9zc1pvbmVFbmFibGVkOiB0cnVlXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IGxpc3RlbmVyID0gbG9hZEJhbGFuY2VyLmFkZExpc3RlbmVyKFwiTGlzdGVuZXJcIiwge1xuICAgICAgcG9ydDogODBcbiAgICB9KTtcblxuICAgIGNvbnN0IHRhcmdldEdyb3VwID0gbGlzdGVuZXIuYWRkVGFyZ2V0cyhcbiAgICAgIFwiQWlyZmxvd0ZhcmdhdGVTZXJ2aWNlVGFyZ2V0R3JvdXBcIixcbiAgICAgIHtcbiAgICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgICBwb3J0OiBcInRyYWZmaWMtcG9ydFwiLFxuICAgICAgICAgIHByb3RvY29sOiBlbGJ2Mi5Qcm90b2NvbC5IVFRQLFxuICAgICAgICAgIHBhdGg6IFwiL2hlYWx0aFwiXG4gICAgICAgIH0sXG4gICAgICAgIHBvcnQ6IDgwLFxuICAgICAgICB0YXJnZXRzOiBbdGhpcy5mYXJnYXRlU2VydmljZV1cbiAgICAgIH1cbiAgICApO1xuICAgIHRhcmdldEdyb3VwLnNldEF0dHJpYnV0ZShcImRlcmVnaXN0cmF0aW9uX2RlbGF5LnRpbWVvdXRfc2Vjb25kc1wiLCBcIjYwXCIpO1xuXG4gICAgcmV0dXJuIGxvYWRCYWxhbmNlci5sb2FkQmFsYW5jZXJEbnNOYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25maWd1cmVBdXRvU2NhbGluZygpOiB2b2lkIHtcbiAgICBjb25zdCBzY2FsaW5nID0gdGhpcy5mYXJnYXRlU2VydmljZS5hdXRvU2NhbGVUYXNrQ291bnQoe1xuICAgICAgbWF4Q2FwYWNpdHk6IHdvcmtlckF1dG9TY2FsaW5nQ29uZmlnLm1heFRhc2tDb3VudCxcbiAgICAgIG1pbkNhcGFjaXR5OiB3b3JrZXJBdXRvU2NhbGluZ0NvbmZpZy5taW5UYXNrQ291bnRcbiAgICB9KTtcblxuICAgIGlmICh3b3JrZXJBdXRvU2NhbGluZ0NvbmZpZy5jcHVVc2FnZVBlcmNlbnQpIHtcbiAgICAgIHNjYWxpbmcuc2NhbGVPbkNwdVV0aWxpemF0aW9uKFwiQ3B1U2NhbGluZ1wiLCB7XG4gICAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogd29ya2VyQXV0b1NjYWxpbmdDb25maWcuY3B1VXNhZ2VQZXJjZW50LFxuICAgICAgICBzY2FsZUluQ29vbGRvd246IER1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICBzY2FsZU91dENvb2xkb3duOiBEdXJhdGlvbi5zZWNvbmRzKDYwKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHdvcmtlckF1dG9TY2FsaW5nQ29uZmlnLm1lbVVzYWdlUGVyY2VudCkge1xuICAgICAgc2NhbGluZy5zY2FsZU9uTWVtb3J5VXRpbGl6YXRpb24oXCJNZW1vcnlTY2FsaW5nXCIsIHtcbiAgICAgICAgdGFyZ2V0VXRpbGl6YXRpb25QZXJjZW50OiB3b3JrZXJBdXRvU2NhbGluZ0NvbmZpZy5tZW1Vc2FnZVBlcmNlbnQsXG4gICAgICAgIHNjYWxlSW5Db29sZG93bjogRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgIHNjYWxlT3V0Q29vbGRvd246IER1cmF0aW9uLnNlY29uZHMoNjApXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==