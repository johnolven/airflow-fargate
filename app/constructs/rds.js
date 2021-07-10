"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const aws_rds_1 = require("@aws-cdk/aws-rds");
const aws_secretsmanager_1 = require("@aws-cdk/aws-secretsmanager");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
const config_1 = require("../config");
class RDSConstruct extends core_1.Construct {
    constructor(parent, name, props) {
        super(parent, name);
        const backendSecret = new aws_secretsmanager_1.Secret(this, "DatabseSecret", {
            secretName: name + "Secret",
            description: "airflow RDS secrets",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: config_1.defaultDBConfig.masterUsername
                }),
                generateStringKey: "password",
                excludeUppercase: false,
                requireEachIncludedType: false,
                includeSpace: false,
                excludePunctuation: true,
                excludeLowercase: false,
                excludeNumbers: false,
                passwordLength: 16
            }
        });
        const databasePasswordSecret = backendSecret.secretValueFromJson("password");
        this.rdsInstance = new aws_rds_1.DatabaseInstance(this, "RDSInstance", {
            engine: aws_rds_1.DatabaseInstanceEngine.postgres({
                version: aws_rds_1.PostgresEngineVersion.VER_12_4
            }),
            instanceType: config_1.defaultDBConfig.instanceType,
            instanceIdentifier: config_1.defaultDBConfig.dbName,
            vpc: props.vpc,
            securityGroups: [props.defaultVpcSecurityGroup],
            vpcPlacement: { subnetType: aws_ec2_1.SubnetType.PRIVATE },
            storageEncrypted: true,
            multiAz: false,
            autoMinorVersionUpgrade: false,
            allocatedStorage: config_1.defaultDBConfig.allocatedStorageInGB,
            storageType: aws_rds_1.StorageType.GP2,
            backupRetention: core_1.Duration.days(config_1.defaultDBConfig.backupRetentionInDays),
            deletionProtection: false,
            credentials: {
                username: config_1.defaultDBConfig.masterUsername,
                password: databasePasswordSecret
            },
            databaseName: config_1.defaultDBConfig.dbName,
            port: config_1.defaultDBConfig.port
        });
        this.dbConnection = this.getDBConnection(config_1.defaultDBConfig, this.rdsInstance.dbInstanceEndpointAddress, databasePasswordSecret.toString());
    }
    getDBConnection(dbConfig, endpoint, password) {
        return `postgresql+pygresql://${dbConfig.masterUsername}:${password}@${endpoint}:${dbConfig.port}/${dbConfig.dbName}`;
    }
}
exports.RDSConstruct = RDSConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQW9EO0FBQ3BELDhDQUkwQjtBQUMxQixvRUFBOEQ7QUFDOUQsOENBSzBCO0FBRTFCLHNDQUE0QztBQWlCNUMsTUFBYSxZQUFhLFNBQVEsZ0JBQVM7SUFJekMsWUFBWSxNQUFpQixFQUFFLElBQVksRUFBRSxLQUF3QjtRQUNuRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXBCLE1BQU0sYUFBYSxHQUFZLElBQUksMkJBQU0sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQy9ELFVBQVUsRUFBRSxJQUFJLEdBQUcsUUFBUTtZQUMzQixXQUFXLEVBQUUscUJBQXFCO1lBQ2xDLG9CQUFvQixFQUFFO2dCQUNwQixvQkFBb0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNuQyxRQUFRLEVBQUUsd0JBQWUsQ0FBQyxjQUFjO2lCQUN6QyxDQUFDO2dCQUNGLGlCQUFpQixFQUFFLFVBQVU7Z0JBQzdCLGdCQUFnQixFQUFFLEtBQUs7Z0JBQ3ZCLHVCQUF1QixFQUFFLEtBQUs7Z0JBQzlCLFlBQVksRUFBRSxLQUFLO2dCQUNuQixrQkFBa0IsRUFBRSxJQUFJO2dCQUN4QixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixjQUFjLEVBQUUsS0FBSztnQkFDckIsY0FBYyxFQUFFLEVBQUU7YUFDbkI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLHNCQUFzQixHQUFHLGFBQWEsQ0FBQyxtQkFBbUIsQ0FDOUQsVUFBVSxDQUNYLENBQUM7UUFFRixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksMEJBQWdCLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMzRCxNQUFNLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO2dCQUN0QyxPQUFPLEVBQUUsK0JBQXFCLENBQUMsUUFBUTthQUN4QyxDQUFDO1lBQ0YsWUFBWSxFQUFFLHdCQUFlLENBQUMsWUFBWTtZQUMxQyxrQkFBa0IsRUFBRSx3QkFBZSxDQUFDLE1BQU07WUFDMUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDO1lBQy9DLFlBQVksRUFBRSxFQUFFLFVBQVUsRUFBRSxvQkFBVSxDQUFDLE9BQU8sRUFBRTtZQUNoRCxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsdUJBQXVCLEVBQUUsS0FBSztZQUM5QixnQkFBZ0IsRUFBRSx3QkFBZSxDQUFDLG9CQUFvQjtZQUN0RCxXQUFXLEVBQUUscUJBQVcsQ0FBQyxHQUFHO1lBQzVCLGVBQWUsRUFBRSxlQUFRLENBQUMsSUFBSSxDQUFDLHdCQUFlLENBQUMscUJBQXFCLENBQUM7WUFDckUsa0JBQWtCLEVBQUUsS0FBSztZQUN6QixXQUFXLEVBQUU7Z0JBQ1gsUUFBUSxFQUFFLHdCQUFlLENBQUMsY0FBYztnQkFDeEMsUUFBUSxFQUFFLHNCQUFzQjthQUNqQztZQUNELFlBQVksRUFBRSx3QkFBZSxDQUFDLE1BQU07WUFDcEMsSUFBSSxFQUFFLHdCQUFlLENBQUMsSUFBSTtTQUMzQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQ3RDLHdCQUFlLEVBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFDMUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQ2xDLENBQUM7SUFDSixDQUFDO0lBRU0sZUFBZSxDQUNwQixRQUFrQixFQUNsQixRQUFnQixFQUNoQixRQUFnQjtRQUVoQixPQUFPLHlCQUF5QixRQUFRLENBQUMsY0FBYyxJQUFJLFFBQVEsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEgsQ0FBQztDQUNGO0FBbkVELG9DQW1FQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IER1cmF0aW9uLCBDb25zdHJ1Y3QgfSBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0IHtcbiAgRGF0YWJhc2VJbnN0YW5jZSxcbiAgRGF0YWJhc2VJbnN0YW5jZUVuZ2luZSwgUG9zdGdyZXNFbmdpbmVWZXJzaW9uLFxuICBTdG9yYWdlVHlwZVxufSBmcm9tIFwiQGF3cy1jZGsvYXdzLXJkc1wiO1xuaW1wb3J0IHsgSVNlY3JldCwgU2VjcmV0IH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1zZWNyZXRzbWFuYWdlclwiO1xuaW1wb3J0IHtcbiAgSW5zdGFuY2VUeXBlLFxuICBJU2VjdXJpdHlHcm91cCxcbiAgSVZwYyxcbiAgU3VibmV0VHlwZVxufSBmcm9tIFwiQGF3cy1jZGsvYXdzLWVjMlwiO1xuXG5pbXBvcnQgeyBkZWZhdWx0REJDb25maWcgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgREJDb25maWcge1xuICByZWFkb25seSBkYk5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgbWFzdGVyVXNlcm5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgcG9ydDogbnVtYmVyO1xuICByZWFkb25seSBpbnN0YW5jZVR5cGU6IEluc3RhbmNlVHlwZTtcbiAgcmVhZG9ubHkgYWxsb2NhdGVkU3RvcmFnZUluR0I6IG51bWJlcjtcbiAgcmVhZG9ubHkgYmFja3VwUmV0ZW50aW9uSW5EYXlzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkRTQ29uc3RydWN0UHJvcHMge1xuICByZWFkb25seSB2cGM6IElWcGM7XG4gIHJlYWRvbmx5IGRlZmF1bHRWcGNTZWN1cml0eUdyb3VwOiBJU2VjdXJpdHlHcm91cDtcbiAgcmVhZG9ubHkgZGJDb25maWc/OiBEQkNvbmZpZztcbn1cblxuZXhwb3J0IGNsYXNzIFJEU0NvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBkYkNvbm5lY3Rpb246IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IHJkc0luc3RhbmNlOiBEYXRhYmFzZUluc3RhbmNlO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudDogQ29uc3RydWN0LCBuYW1lOiBzdHJpbmcsIHByb3BzOiBSRFNDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHBhcmVudCwgbmFtZSk7XG5cbiAgICBjb25zdCBiYWNrZW5kU2VjcmV0OiBJU2VjcmV0ID0gbmV3IFNlY3JldCh0aGlzLCBcIkRhdGFic2VTZWNyZXRcIiwge1xuICAgICAgc2VjcmV0TmFtZTogbmFtZSArIFwiU2VjcmV0XCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJhaXJmbG93IFJEUyBzZWNyZXRzXCIsXG4gICAgICBnZW5lcmF0ZVNlY3JldFN0cmluZzoge1xuICAgICAgICBzZWNyZXRTdHJpbmdUZW1wbGF0ZTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHVzZXJuYW1lOiBkZWZhdWx0REJDb25maWcubWFzdGVyVXNlcm5hbWVcbiAgICAgICAgfSksXG4gICAgICAgIGdlbmVyYXRlU3RyaW5nS2V5OiBcInBhc3N3b3JkXCIsXG4gICAgICAgIGV4Y2x1ZGVVcHBlcmNhc2U6IGZhbHNlLFxuICAgICAgICByZXF1aXJlRWFjaEluY2x1ZGVkVHlwZTogZmFsc2UsXG4gICAgICAgIGluY2x1ZGVTcGFjZTogZmFsc2UsXG4gICAgICAgIGV4Y2x1ZGVQdW5jdHVhdGlvbjogdHJ1ZSxcbiAgICAgICAgZXhjbHVkZUxvd2VyY2FzZTogZmFsc2UsXG4gICAgICAgIGV4Y2x1ZGVOdW1iZXJzOiBmYWxzZSxcbiAgICAgICAgcGFzc3dvcmRMZW5ndGg6IDE2XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBkYXRhYmFzZVBhc3N3b3JkU2VjcmV0ID0gYmFja2VuZFNlY3JldC5zZWNyZXRWYWx1ZUZyb21Kc29uKFxuICAgICAgXCJwYXNzd29yZFwiXG4gICAgKTtcblxuICAgIHRoaXMucmRzSW5zdGFuY2UgPSBuZXcgRGF0YWJhc2VJbnN0YW5jZSh0aGlzLCBcIlJEU0luc3RhbmNlXCIsIHtcbiAgICAgIGVuZ2luZTogRGF0YWJhc2VJbnN0YW5jZUVuZ2luZS5wb3N0Z3Jlcyh7XG4gICAgICAgIHZlcnNpb246IFBvc3RncmVzRW5naW5lVmVyc2lvbi5WRVJfMTJfNFxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZVR5cGU6IGRlZmF1bHREQkNvbmZpZy5pbnN0YW5jZVR5cGUsXG4gICAgICBpbnN0YW5jZUlkZW50aWZpZXI6IGRlZmF1bHREQkNvbmZpZy5kYk5hbWUsXG4gICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgIHNlY3VyaXR5R3JvdXBzOiBbcHJvcHMuZGVmYXVsdFZwY1NlY3VyaXR5R3JvdXBdLFxuICAgICAgdnBjUGxhY2VtZW50OiB7IHN1Ym5ldFR5cGU6IFN1Ym5ldFR5cGUuUFJJVkFURSB9LFxuICAgICAgc3RvcmFnZUVuY3J5cHRlZDogdHJ1ZSxcbiAgICAgIG11bHRpQXo6IGZhbHNlLFxuICAgICAgYXV0b01pbm9yVmVyc2lvblVwZ3JhZGU6IGZhbHNlLFxuICAgICAgYWxsb2NhdGVkU3RvcmFnZTogZGVmYXVsdERCQ29uZmlnLmFsbG9jYXRlZFN0b3JhZ2VJbkdCLFxuICAgICAgc3RvcmFnZVR5cGU6IFN0b3JhZ2VUeXBlLkdQMixcbiAgICAgIGJhY2t1cFJldGVudGlvbjogRHVyYXRpb24uZGF5cyhkZWZhdWx0REJDb25maWcuYmFja3VwUmV0ZW50aW9uSW5EYXlzKSxcbiAgICAgIGRlbGV0aW9uUHJvdGVjdGlvbjogZmFsc2UsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICB1c2VybmFtZTogZGVmYXVsdERCQ29uZmlnLm1hc3RlclVzZXJuYW1lLFxuICAgICAgICBwYXNzd29yZDogZGF0YWJhc2VQYXNzd29yZFNlY3JldFxuICAgICAgfSxcbiAgICAgIGRhdGFiYXNlTmFtZTogZGVmYXVsdERCQ29uZmlnLmRiTmFtZSxcbiAgICAgIHBvcnQ6IGRlZmF1bHREQkNvbmZpZy5wb3J0XG4gICAgfSk7XG5cbiAgICB0aGlzLmRiQ29ubmVjdGlvbiA9IHRoaXMuZ2V0REJDb25uZWN0aW9uKFxuICAgICAgZGVmYXVsdERCQ29uZmlnLFxuICAgICAgdGhpcy5yZHNJbnN0YW5jZS5kYkluc3RhbmNlRW5kcG9pbnRBZGRyZXNzLFxuICAgICAgZGF0YWJhc2VQYXNzd29yZFNlY3JldC50b1N0cmluZygpXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXREQkNvbm5lY3Rpb24oXG4gICAgZGJDb25maWc6IERCQ29uZmlnLFxuICAgIGVuZHBvaW50OiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZ1xuICApOiBzdHJpbmcge1xuICAgIHJldHVybiBgcG9zdGdyZXNxbCtweWdyZXNxbDovLyR7ZGJDb25maWcubWFzdGVyVXNlcm5hbWV9OiR7cGFzc3dvcmR9QCR7ZW5kcG9pbnR9OiR7ZGJDb25maWcucG9ydH0vJHtkYkNvbmZpZy5kYk5hbWV9YDtcbiAgfVxufVxuIl19