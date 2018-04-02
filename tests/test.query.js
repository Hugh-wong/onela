let dbconfig = [{
    "name": "default",
    "type": "mysql",
    "value": {
        "connectionLimit": 5,
        "host": "localhost",
        "user": "",
        "password": "",
        "database": "todo"
    }
}]

const Onela = require("../lib/onela");
Onela.init(dbconfig);

const BaseManager = require("../lib/manager");

class ToDoManager extends BaseModelManager {}

ToDoManager.configs = {
    fields: [
        {name: "id", type: "int", default: null},
        {name: "content", type: "varchar"},
        {name: "is_done", type: "int", default: 0},
        {name: "create_time", type: "datetime", default: ()=>{return new Date()}},
        {name: "finish_time", type: "datetime", default: null}
    ], 
    tableName: "todos",
    engine: "default"
}



ToDoManager.getEntity({
    keyword: [
            {"logic": "and", "key": "id", "operator": "=", "value": 1}
        ]
}).then(console.log).then(process.exit);


// ToDoManager.getEntityList({
//     keyword: [
//             {"logic": "and", "key": "id", "operator": "=", "value": 1}
//         ]
// }).then(console.log).then(process.exit);

// ToDoManager.insertEntity({
//     content: "设计智能保险顾问的用户体系"
// }).then(console.log).then(process.exit);




// ToDoManager.insertBatch([
//     {content: "测试1"},
//     {content: "测试2"},
//     {content: "测试3"}
// ]).then(console.log).then(process.exit);


// ToDoManager.deleteEntity({
//     keyword: [
//         {"key": "id", operator: "in", value: [8,9,10], logic: "and"},
//         // {"key": "is_done", operator: "=", value: 1, logic: "and"}
//     ]
// }).then(console.log).then(process.exit);


// ToDoManager.updateEntity({
//     update: [
//         {key: "is_done", value: 1, operator: "replace"}
//     ],
//     keyword: [
//         {"key": "id", operator: "in", value: [1,2,3], logic: "and"},
//     ]
// }).then(console.log).then(process.exit);

// ToDoManager.getEntityByAggregate({
//     // keyword: 
//     "aggregate":[
//         {"function": "count", "field": "is_done", "name": "undone_tasks"},
//     ]
// }).then(console.log).then(process.exit);

