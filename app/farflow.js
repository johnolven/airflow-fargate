"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ec2 = require("@aws-cdk/aws-ec2");
const ecs = require("@aws-cdk/aws-ecs");
const cdk = require("@aws-cdk/core");
const rds_1 = require("./constructs/rds");
const airflow_construct_1 = require("./constructs/airflow-construct");
const dag_tasks_1 = require("./constructs/dag-tasks");
class FarFlow extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create VPC and Fargate Cluster
        // NOTE: Limit AZs to avoid reaching resource quotas
        let vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
        cdk.Tags.of(scope).add("Stack", "FarFlow");
        let cluster = new ecs.Cluster(this, 'ECSCluster', { vpc: vpc });
        // Setting default SecurityGroup to use across all the resources
        let defaultVpcSecurityGroup = new ec2.SecurityGroup(this, "SecurityGroup", { vpc: vpc });
        // Create RDS instance for Airflow backend
        const rds = new rds_1.RDSConstruct(this, "RDS-Postgres", {
            defaultVpcSecurityGroup: defaultVpcSecurityGroup,
            vpc: vpc
        });
        // Create Airflow service: Webserver, Scheduler and minimal Worker
        new airflow_construct_1.AirflowConstruct(this, "AirflowService", {
            cluster: cluster,
            vpc: vpc,
            dbConnection: rds.dbConnection,
            defaultVpcSecurityGroup: defaultVpcSecurityGroup,
            privateSubnets: vpc.privateSubnets
        });
        // Create TaskDefinitions for on-demand Fargate tasks, invoked from DAG
        new dag_tasks_1.DagTasks(this, "DagTasks", {
            vpc: vpc,
            defaultVpcSecurityGroup: defaultVpcSecurityGroup
        });
    }
}
const app = new cdk.App();
new FarFlow(app, 'FarFlow');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFyZmxvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZhcmZsb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3Q0FBeUM7QUFDekMsd0NBQXlDO0FBQ3pDLHFDQUFzQztBQUN0QywwQ0FBOEM7QUFDOUMsc0VBQWdFO0FBQ2hFLHNEQUFrRDtBQUVsRCxNQUFNLE9BQVEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUU3QixZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsaUNBQWlDO1FBQ2pDLG9EQUFvRDtRQUNwRCxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFM0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVoRSxnRUFBZ0U7UUFDaEUsSUFBSSx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1FBRXZGLDBDQUEwQztRQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGtCQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNqRCx1QkFBdUIsRUFBRSx1QkFBdUI7WUFDaEQsR0FBRyxFQUFFLEdBQUc7U0FDVCxDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsSUFBSSxvQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDM0MsT0FBTyxFQUFFLE9BQU87WUFDaEIsR0FBRyxFQUFFLEdBQUc7WUFDUixZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVk7WUFDOUIsdUJBQXVCLEVBQUUsdUJBQXVCO1lBQ2hELGNBQWMsRUFBRSxHQUFHLENBQUMsY0FBYztTQUNuQyxDQUFDLENBQUM7UUFFSCx1RUFBdUU7UUFDdkUsSUFBSSxvQkFBUSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDN0IsR0FBRyxFQUFFLEdBQUc7WUFDUix1QkFBdUIsRUFBRSx1QkFBdUI7U0FDakQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBRTVCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBlYzIgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtZWMyJyk7XG5pbXBvcnQgZWNzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWVjcycpO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCB7UkRTQ29uc3RydWN0fSBmcm9tIFwiLi9jb25zdHJ1Y3RzL3Jkc1wiO1xuaW1wb3J0IHtBaXJmbG93Q29uc3RydWN0fSBmcm9tIFwiLi9jb25zdHJ1Y3RzL2FpcmZsb3ctY29uc3RydWN0XCI7XG5pbXBvcnQgeyBEYWdUYXNrcyB9IGZyb20gJy4vY29uc3RydWN0cy9kYWctdGFza3MnO1xuXG5jbGFzcyBGYXJGbG93IGV4dGVuZHMgY2RrLlN0YWNrIHtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIFZQQyBhbmQgRmFyZ2F0ZSBDbHVzdGVyXG4gICAgLy8gTk9URTogTGltaXQgQVpzIHRvIGF2b2lkIHJlYWNoaW5nIHJlc291cmNlIHF1b3Rhc1xuICAgIGxldCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnVnBjJywgeyBtYXhBenM6IDIgfSk7XG4gICAgY2RrLlRhZ3Mub2Yoc2NvcGUpLmFkZChcIlN0YWNrXCIsIFwiRmFyRmxvd1wiKTtcblxuICAgIGxldCBjbHVzdGVyID0gbmV3IGVjcy5DbHVzdGVyKHRoaXMsICdFQ1NDbHVzdGVyJywgeyB2cGM6IHZwYyB9KTtcblxuICAgIC8vIFNldHRpbmcgZGVmYXVsdCBTZWN1cml0eUdyb3VwIHRvIHVzZSBhY3Jvc3MgYWxsIHRoZSByZXNvdXJjZXNcbiAgICBsZXQgZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgXCJTZWN1cml0eUdyb3VwXCIsIHt2cGM6IHZwY30pO1xuXG4gICAgLy8gQ3JlYXRlIFJEUyBpbnN0YW5jZSBmb3IgQWlyZmxvdyBiYWNrZW5kXG4gICAgY29uc3QgcmRzID0gbmV3IFJEU0NvbnN0cnVjdCh0aGlzLCBcIlJEUy1Qb3N0Z3Jlc1wiLCB7XG4gICAgICBkZWZhdWx0VnBjU2VjdXJpdHlHcm91cDogZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXAsXG4gICAgICB2cGM6IHZwY1xuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFpcmZsb3cgc2VydmljZTogV2Vic2VydmVyLCBTY2hlZHVsZXIgYW5kIG1pbmltYWwgV29ya2VyXG4gICAgbmV3IEFpcmZsb3dDb25zdHJ1Y3QodGhpcywgXCJBaXJmbG93U2VydmljZVwiLCB7XG4gICAgICBjbHVzdGVyOiBjbHVzdGVyLFxuICAgICAgdnBjOiB2cGMsXG4gICAgICBkYkNvbm5lY3Rpb246IHJkcy5kYkNvbm5lY3Rpb24sXG4gICAgICBkZWZhdWx0VnBjU2VjdXJpdHlHcm91cDogZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXAsXG4gICAgICBwcml2YXRlU3VibmV0czogdnBjLnByaXZhdGVTdWJuZXRzXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgVGFza0RlZmluaXRpb25zIGZvciBvbi1kZW1hbmQgRmFyZ2F0ZSB0YXNrcywgaW52b2tlZCBmcm9tIERBR1xuICAgIG5ldyBEYWdUYXNrcyh0aGlzLCBcIkRhZ1Rhc2tzXCIsIHtcbiAgICAgIHZwYzogdnBjLFxuICAgICAgZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXA6IGRlZmF1bHRWcGNTZWN1cml0eUdyb3VwXG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxubmV3IEZhckZsb3coYXBwLCAnRmFyRmxvdycpO1xuXG5hcHAuc3ludGgoKTtcbiJdfQ==