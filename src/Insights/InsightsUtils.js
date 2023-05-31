export const BAR_CHART_TEXTS = [
  {
    type: 'toTriage',
    title: 'Pending to Triage:',
    tooltip: {
      title: 'Tests pending to be triaged summarized by Folder.',
      help: [
        'New Fails: Are tests that have been passing for long and now they have failed.',
        'Fails: Tests that are failing.',
        'Now Passing: Are tests that have been failing for long and now they pass.',
      ]
    }
  },
  {
    type: 'productSummary',
    title: 'Product Summary',
    tooltip: {
      title: 'Tests pending to be triaged summarized by Product.',
      help: [
        'New Fails: Are tests that have been passing for long and now they have failed.',
        'Fails: Tests that are failing.',
        'Now Passing: Are tests that have been failing for long and now they pass.',
      ]
    }
  },
    {
        type: 'testsCreated',
        title: 'Tests Created Per Author',
        tooltip: {
            title: 'tests Created Per Author',
            help: [
                'Author:Creator name',
                
            ]
        }
    },
    {
        type: 'testExecuted',
        title: 'Tests Executed Per Author',
        tooltip: {
            title: 'Tests Executed Per Author',
            help: [
                'Author:Creator name',

            ]
        }
    },
	{
		type: 'productCoverage',
		title: 'Product Coverage',
		tooltip: {
			title: 'Tests coverage by component.',
			help: [
				'Fails: Tests that are failing.',
				'Passing: Tests that are passing.',
				'Pending: Tests pending to be executed.',
				'Goals: Amount of tests to create'
			]
		}
	},
    {
        type: 'testCreatedAndExecution',
        title: 'Component ManualTest And Component Execution',
        tooltip: {
            title: 'Component ManualTest And Component Execution.',
            help: [
                'Name: Component name .',
                'Count: Count Component.',
            ]
        }
    },
  {
    type: 'automationFixedPending',
    title: 'Automation Fixed & Pending',
    tooltip: {
      title: 'Automation Tests Issues',
      help: [
        'Fixed: All test fixed by user',
        'Pending: Tests pending to be fixed assigned to the user',
      ]
    }
  },
    {
        type: 'componentBasedTriages',
        title: 'Test Triages based in Components',
        tooltip: {
            title: 'Test Triages based in Components.',
            help: [
                'Fails: All Test Triages that failed',
                'Flaky: All flaky Tests Triages.',
                'Pass: All Test Triages that passed.'

            ]
        }
    }
]
