"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aws-cdk/core");
const aws_iam_1 = require("@aws-cdk/aws-iam");
class PolicyConstruct extends core_1.Construct {
    constructor(app, name) {
        super(app, name);
        // Both managed policies and policy statements will be attached to Task Role of Airflow Instance
        this.managedPolicies = [
            aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AmazonSQSFullAccess"),
            aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AmazonECS_FullAccess"),
            aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AmazonElasticFileSystemClientReadWriteAccess"),
            aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsReadOnlyAccess")
        ];
        /*
          You can add custom Policy Statements as well.
          Sample code for SQS and IAM Full Access would like like:

          this.policyStatements = [
            new PolicyStatement({
                actions: ["sqs:*"],
                effect: Effect.ALLOW,
                resources: ["*"]
            }),
            new PolicyStatement({
                actions: ["iam:*"],
                effect: Effect.ALLOW,
                resources: ["*"]
            })
          ]
        */
    }
}
exports.PolicyConstruct = PolicyConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWNpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwb2xpY2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUEwQztBQUMxQyw4Q0FBa0Y7QUFFbEYsTUFBYSxlQUFnQixTQUFRLGdCQUFTO0lBSTFDLFlBQVksR0FBYyxFQUFFLElBQVk7UUFDcEMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVqQixnR0FBZ0c7UUFDaEcsSUFBSSxDQUFDLGVBQWUsR0FBRztZQUNuQix1QkFBYSxDQUFDLHdCQUF3QixDQUFDLHFCQUFxQixDQUFDO1lBQzdELHVCQUFhLENBQUMsd0JBQXdCLENBQUMsc0JBQXNCLENBQUM7WUFDOUQsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyw4Q0FBOEMsQ0FBQztZQUN0Rix1QkFBYSxDQUFDLHdCQUF3QixDQUFDLDhCQUE4QixDQUFDO1NBQ3pFLENBQUM7UUFFRjs7Ozs7Ozs7Ozs7Ozs7OztVQWdCRTtJQUNOLENBQUM7Q0FDSjtBQWpDRCwwQ0FpQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0IHsgSU1hbmFnZWRQb2xpY3ksIE1hbmFnZWRQb2xpY3ksIFBvbGljeVN0YXRlbWVudCB9IGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5cbmV4cG9ydCBjbGFzcyBQb2xpY3lDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgIHB1YmxpYyByZWFkb25seSBwb2xpY3lTdGF0ZW1lbnRzPzogUG9saWN5U3RhdGVtZW50W107XG4gICAgcHVibGljIHJlYWRvbmx5IG1hbmFnZWRQb2xpY2llcz86IElNYW5hZ2VkUG9saWN5W107XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IENvbnN0cnVjdCwgbmFtZTogc3RyaW5nLCkge1xuICAgICAgICBzdXBlcihhcHAsIG5hbWUpO1xuXG4gICAgICAgIC8vIEJvdGggbWFuYWdlZCBwb2xpY2llcyBhbmQgcG9saWN5IHN0YXRlbWVudHMgd2lsbCBiZSBhdHRhY2hlZCB0byBUYXNrIFJvbGUgb2YgQWlyZmxvdyBJbnN0YW5jZVxuICAgICAgICB0aGlzLm1hbmFnZWRQb2xpY2llcyA9IFtcbiAgICAgICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uU1FTRnVsbEFjY2Vzc1wiKSxcbiAgICAgICAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRUNTX0Z1bGxBY2Nlc3NcIiksXG4gICAgICAgICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvbkVsYXN0aWNGaWxlU3lzdGVtQ2xpZW50UmVhZFdyaXRlQWNjZXNzXCIpLFxuICAgICAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJDbG91ZFdhdGNoTG9nc1JlYWRPbmx5QWNjZXNzXCIpXG4gICAgICAgIF07XG5cbiAgICAgICAgLypcbiAgICAgICAgICBZb3UgY2FuIGFkZCBjdXN0b20gUG9saWN5IFN0YXRlbWVudHMgYXMgd2VsbC4gXG4gICAgICAgICAgU2FtcGxlIGNvZGUgZm9yIFNRUyBhbmQgSUFNIEZ1bGwgQWNjZXNzIHdvdWxkIGxpa2UgbGlrZTpcblxuICAgICAgICAgIHRoaXMucG9saWN5U3RhdGVtZW50cyA9IFtcbiAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcInNxczoqXCJdLFxuICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJpYW06KlwiXSxcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICAqL1xuICAgIH1cbn0iXX0=