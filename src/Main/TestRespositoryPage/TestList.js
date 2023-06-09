import React from 'react';
import * as _  from "underscore";
import {DEFAULT_AUTOMATED_TEST_FILTERS as test, TEST_PLAN_STATUS_ALL} from "../Components/Globals";
import TestRepository from "./TestRepository";
import {TestListItem} from "./TestListItem";

export const TestList = (props) => {



    let {
         testList,
         selectedTests,
         expandedTests,
         filters,
         classes,
         that,
        } = props

    return (
        testList && testList.map((test, index) => {
                let planStatus = _.find(TEST_PLAN_STATUS_ALL, {value: test.lastExecution})
                return (
                    <TestListItem testList = {testList}
                                  selectedTests={selectedTests}
                                  expandedTests={expandedTests}
                                  filters={filters}
                                  classes={classes}
                                  that={that}
                                  test={test}
                                  planStatus={planStatus}/>
                )
        })
    )


}