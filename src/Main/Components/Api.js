import axios from 'axios'

class API {
    constructor(defaultBaseUrl, data){
        this.defaultBaseUrl = defaultBaseUrl
        this.ENDPOINTS = data
    }

    login = (user, internal = true) => {
        if (internal) {
            return axios.post(this.getBaseUrl() + this.ENDPOINTS.AuthLogin, {
              ...user
            })
            .then(res => {
                if (res.status === 200) {
                  let {accessToken, tokenType} = res.data
                  localStorage.setItem("auth", accessToken)
                  localStorage.setItem("tokenType", tokenType)
                  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
                } else throw Error("Unauthorized")
            })
        }
    }
    getBaseUrl = () => window.config && window.config.apiurl ? window.config.apiurl : this.defaultBaseUrl
}

export default new API(
    process.env.BASE_URL,
    {
    AuthLogin: "/auth/login",
    AuthSignUp: "/auth/signup",
    GetExecutor: "/v1/view/executor/get/",
    GetExecutors: "/v1/executor/listEnabled",
    GetExecutorPass: "/v1/view/executor/get/passed/",
    ViewExecutors: "/v1/view/executor/list",
    GetViewExecutorHistory: "/v1/view/executor/history/",
    SearchExecutors: "/v1/executor/search",
    GetExecutorByID: "/v1/executor/get/",
    GetTrendGoalByID: "/v1/trendGoal/get",
    CreateTrendGoal: "/v1/trendGoal/newGoal",
    CreateProductGoal: "/v1/productGoal/newProductGoal",
    UpdateTrendGoal: "/v1/trendGoal/update",
    UpdateExecutor: "/v1/executor/update",
    GetCurrentUser: "/v1/user/@me",
    GetUsers: "/v1/user/list",
    GetUser: "/v1/user/get/",
    GetUsertTerms: "/v1/user/terms",
    GetSuggestedUsers: "/v1/view/executor/user/suggested",
    GetMyList: "/v1/view/executor/suggested",
    GetUsersActivities: "/v1/board/view",
    GetMyPendingIssues: "/v1/automatedtestIssue/pendingfix",
    SearchUsers: "/v1/user/search",
    GetTestTriage: "/v1/triage/test/get/",
    UpdateTest: "/v1/triage/test/update",
    GetTestTriageDetails: "/v1/triage/test/detail/",
    ViewTestCases: "/v1/view/testcase/list",
    PostIssueTicket: "/v1/issueticket/create",
    GetIssuesTicket: "/v1/issueticket/list",
    GetTestSteps: "/v1/test/steps/",
    GetIssueTicket: "/v1/issueticket/get/",
    GetContainerList: "/v1/container/suggested",
    GetTestSummary: "/v1/stats/testSummary",
    GetToTriage: "/v1/stats/toTriage",
    GetComponentBasedTriage:"/v1/stats/componentBasedTriages",
    GetFailExceptions: "/v1/stats/failExceptions",
    GetManualTest:"/v1/stats/manualTest",
         GetMANUALTESTEXECUTION_SINCE:'/v1/manualExecution/manualTestExecutionSince',
        GetManualTestSince:'/v1/manualTest/manualTestSince',
    GetBurndown: "/v1/stats/globalBurndownFailNewFixes",
    GetUniqueTests: "/v1/stats/uniqueTests",
    GetTotalAutomationFixed: "/v1/stats/totalAutomationFixes",
    GetTotalSavedTime: "/v1/stats/totalSavedTime",
    GetDeadlinesCompleted: "/v1/stats/deadlinesCompleted",
    GetMissingDeadlines: "/v1/stats/missingDeadlines",
    GetBugsFiled: "/v1/stats/bugFiled",
    GetProductSummary: "/v1/stats/productSummary",
    GetAutomationFixedPending: "/v1/stats/totalAutomationFixedAndPending/user",
    GetAutomationPendingAndFixesForUser: "/v1/stats/totalAutomationPendingAndFixes/loggedUser",
    GetTriagesForDayForUser: "/v1/stats/totalTriagesForDay/loggedUser",
    GetEngineerEffort: "/v1/stats/engineerEffort",
    GetSuiteEvolution: "/v1/stats/suiteEvolution",
    GetFailedTests: "/v1/stats/failedTests",
        GetCommitsPerPerson: "/v1/stats/totalCommitsPerUser",
        GetCommitsPerDay: "/v1/stats/totalCommitsPerDay",
        GetCommitsPerPersonAndPerDay: "/v1/stats/totalCommitsPerPersonAndPerDay",
    GetTestHistory: "/v1/triage/test/history/",
    TriageSuite: "/v1/actions/build/triaged",
    InvalidateSuite: "/v1/actions/build/invalidate",
    DisableSuite: "/v1/actions/build/disable",
    EnableSuite: "/v1/actions/build/enable",
    PullSuite: "/v1/executor/populate",
    PushSuite: "/v1/executor/push",
    AssignSuite: "/v1/actions/build/assign",
    AssignPipeline: "/v1/actions/pipeline/assign",
    AssignAutomationIssue: "/v1/actions/automatedtestIssue/assign",
    AutoTriageSuite: "",
    GetAutomationIssues: "/v1/automatedtestIssue/list",
    PostAutomationIssues: "/v1/automatedtestIssue/create",
    UpdateAutomationIssues: "/v1/automatedtestIssue/update",
    GetAutomationIssue: "/v1/automatedtestIssue/get",
    GetTestExecutionByTestCase: "v1/test/testCase/500011test/testCase/",
    UpdateTestTriagePin: "/v1/triage/test/pin",
    UpdateTestTriage: "/v1/triage/test/draft",
    TriageTest: "/v1/actions/test/triaged",
    TriageTestAll: "/v1/triage/test/triagedAll",
    GetReportDetails: '/v1/triage/build/detail',
    SetPriority: "/v1/view/executor/priority/assign",
    BuildInfo: "/v1/info/build",
    WelcomeMessage: "/v1/info/WELCOME_MESSAGE",
    GetGoogleUA: "/v1/info/GOOGLE_ANALYTICS_UA",
    InternalUsersEnabled: "/v1/property/internaluser",
    GetManualTests: "/v1/manualTest/list",
        GetLinkManualTestToAutomatedTest: "/v1/manualTest/linkManualToAutomated",
        GetManualTestsToAutomate: "/v1/manualTest/toAutomate",
        GetFilteredManualTests: "/v1/manualTest/list/filters",
        SaveTriageSpec: "/v1/spec/create",
        UpdateTriageSpec: "/v1/spec/update",
        SaveAutomatedTests: "/v1/automatedtest/create",
        UpdateAutomatedTests: "/v1/automatedtest/update",
        GetAutomatedTests: "/v1/automatedtest/list",
        GetFilteredAutomatedTests: "/v1/automatedtest/list/filters",
        SaveManualTest: "/v1/manualTest/create",
        UpdateManualTest: "/v1/manualTest/update",
        SearchFunctionalities: "/v1/functionality/search",
        FindFunctionalityByExternalId: "/v1/functionality/find/externalId",
        GetFunctionality: "/v1/functionality/get",
        SaveFunctionality: "/v1/functionality/create",
        UpdateFunctionality: "/v1/functionality/update",
        ImportReport: "/v1/manualTest/importReport",
        AutomationImportReport: "/v1/executor/importReport",
        GetPipelineList: "/v1/pipeline/listEnabled",
        GetPipelineContainers: "/v1/pipeline/containers",
        UpdatePipeline: "/v1/pipeline/update",
        SavePipeline: "/v1/pipeline/create",
        DeletePipeline: "/v1/pipeline/delete/",
        GetPipelinePerContainer: "/v1/pipeline/container",
        GetPipelineView: "/v1/pipeline/ongoingList",
        GetFilteredPipelineList: "/v1/pipeline/list/search",
    GetPipeline: "/v1/pipeline/get/",
    AddTestsToPipe: "/v1/pipeline/Assign",
    DeleteTestCaseFromPipeline: "/v1/pipeline/deleteWithTest",
    GetTestPlanReport: "/v1/manualPlan/manualPlan",
    GetTestPlanList: "/v1/manualPlan/list",
        GetTestsExecutionList: "/v1/manualExecution/find/",
        deleteExecutionByPlanAndCase: "/v1/manualExecution/deleteByPlanAndCase",
        GetTestPlanById: "/v1/manualPlan/get/",
        AddTestsToPlan: "/v1/manualPlan/Assign",
        SaveTestPlan: "/v1/manualPlan/create",
        UpdateTestPlan: "/v1/manualPlan/update",
        GetManualTestExecutions: "/v1/manualExecution/list",
        UpdateManualTestExecution: "/v1/manualExecution/update",
        SearchProductComponents: "/v1/productComponent/search",
        SuggestProductComponents: "/v1/productComponent/suggested",
        AddProductComponent: "/v1/productComponent/create",
        SearchAutomatedComponents: "/v1/automatedComponent/search",
        SuggestedDefaultAutomatedComponents: "/v1/automatedComponent/suggested",
        SuggestedAutomatedComponents: "/v1/automatedComponent/search/suggested",
        SetAutomatedComponentToTests: "/v1/automatedComponent/assign",
        DeleteAutomatedComponentFromTest: "/v1/automatedComponent/deleteByComponentAndTest",
        AddAutomatedComponent: "/v1/automatedComponent/create",
        DownloadUserReport: "/v1/export/userReport.PDF",
        DownloadProductReport: "/v1/export/productReport.PDF",
        // Admin
        GetProducts: "/v1/product/list",
        GetProductsAmount: "/v1/product/list/size",
        DisableProduct: "/v1/product/delete/",
        CreateProduct: "/v1/product/create",
        UpdateProduct: "/v1/product/update",
        UpdateFields: "/v1/product/updateFields",
    GetConnectors: "/v1/connector/list",
    CreateConnector: "/v1/connector/create",
    DisableConnector: "/v1/connector/delete/",
    PopulateConnector: "/v1/connector/populate/id/",
    UpdateConnector: "/v1/connector/update",
    ValidateConnector: "/v1/connector/validate/",
    GetAuthToken: "/v1/connector/auth/get/",
    CreateAuthToken: "/v1/connector/auth/create/",
    GetContainers: "/v1/container/list",
    CreateContainer: "/v1/container/create",
    DisableContainer: "/v1/container/delete/",
    UpdateContainer: "/v1/container/update",
    PopulateContainer: "/v1/container/populate/id/",
    ValidateContainer: "/v1/container/validate/",
    GetProperties: "/v1/property/list",
    GetPropertyByName: "/v1/property/",
    DisableProperty: "/v1/property/delete/",
    UpdateProperty: "/v1/property/update",
    CreateProperty: "/v1/property/create",
    FindProperty: "/v1/property/find/",
    GetMilestones: "/v1/deadline/list",
    DisableMilestone: "/v1/deadline/delete/",
    UpdateMilestone: "/v1/deadline/update",
    CreateMilestone: "/v1/deadline/create",
    DisableUser: "/v1/user/delete/",
    UpdateUser: "/v1/user/update",
    CreateUser: "/v1/user/create",
    CreateSlackIntegration: "/v1/slack/create",
    UpdateSlackIntegration: "/v1/slack/update/",
    GetSlackIntegration: "/v1/slack/container",
    GetExecutorSlackIntegration: "/v1/slack/executor",
		TestSlackIntegration: "/v1/slack/test",
    SearchTestCases: "/v1/test/search",
        GetCVSRepositories: "/v1/cvsRepository/list",
        DisableCVSRepository: "/v1/cvsRepository/delete/",
        UpdateCVSRepository: "/v1/cvsRepository/update",
        CreateCVSRepository: "/v1/cvsRepository/create",

    GetExecutorGrowthStat:"/v1/executor/getGrowthStats/",
    GetExecutorPassingStat:"/v1/executor/getPassingStats/",
    GetExecutorCommitsStat:"/v1/executor/getCommitsStats/",
    GetExecutorTriageDoneStat:"/v1/executor/getTriageDoneStats/",
    GetExecutorStabilityStat:"/v1/executor/getStabilityStats/",
    GetNotifications: "/v1/notification/get",
    NotificationsCount: "/v1/notification/count",
    NotificationsMarkAsSeen: "/v1/notification/markAsSeen",
    DeleteNotification: "/v1/notification/delete/",
    UpdateNotification: "/v1/notification/update",
    HealthInfo: "/v1/info/health",
    EventExecutionImportLogs: "/v1/eventExecution/importLogEvents",
    GetLogs: "/v1/log/get",
    getLogsFile: "/v1/log/download",

        GetJavaConfiguration: "/v1/configuration/javaConfiguration",
        CreateJiraConfig: "/v1/configuration/create",
        GetJiraConfig: "/v1/configuration/jiraConfig",
        SaveJiraConfig: "/v1/configuration/save",

        JiraProjectKeys: "/v1/jiraCode/projectKeys",
        JiraProjectStates: "/v1/jiraCode/projectStates",
        JiraConnect:"/v1/info/jiraauth",
        JiraProjects: "/v1/jiraApi/projectList",
        JiraProjectStatus: "/v1/jiraApi/projectStatus",
        JiraIssuetype:"/v1/jiraApi/searchIssuetype",
    JiraProjectsFields: "https://api.atlassian.com/ex/jira/e0d92f42-dda5-4286-975d-69de9b25b7c3/rest/api/3/issue/createmeta"
    })
