
const oParameters = require("./oParameters.js");

/**
 * 负责多个database的管理，能够初始化数据库连接
 */
class Onela {

    static getActionManagerClass (db_type) {
        switch (db_type) {
        case "mysql":
            return MySQLActionManager;
        default:
            return MySQLActionManager;
        }
    }

    static init(config_list){
        var self = this;
        for(let tempConfig of config_list) {
            let temp_am = self.getActionManagerClass(tempConfig.type);
            temp_am.init(tempConfig.value);
            self._connections[tempConfig.name] = temp_am;
        }
    }

    static getActionManager (name) {
        if (!(name in this._connections)) {
            throw new Error(`invalid name: ${name}`);
        }
        return this._connections[name];
    }
}

Onela._connections = {};


class BaseActionManager {

    static init (config) {
        throw new Error("not implemented");
    }
}


/**
 * 单例的数据库操作管理者，负责这个数据库的基本crud，负责全局的一个连接；
 */
class MySQLActionManager extends BaseActionManager {

    
    static init (config) {
        const mysql = require("mysql");
        let connPool = mysql.createPool(config);
        this.conn = connPool;
    }

    static execute(sql, parameters) {
        var self = this;
        return new Promise(function (resolve, reject) {
            // console.log(sql);
            // console.log(parameters);
            console.time('【onela】执行SQL时间');
            if (self.conn) {
                self.conn.query(sql, parameters, function (err, doc) {
                    console.timeEnd('【onela】执行SQL时间');
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(doc);
                    }
                });
            }
            else {
                reject("数据库instance实例未正确指向，请检查oodbc数据实例配置和表结构配置（onelaInstanceConfig.json）的实例对照是否正确");
            }
        });
    }

    static queryEntity (params) {
        var self = this;
        var p = oParameters.getParameters(params);
        var sql = "select  " + p["select"] + " from " + params.configs.tableName + " as t " + p.where + p.orderBy + p.limit + ";";
        return self.execute(sql, p.parameters)
            .catch(function (err) {
                console.log('执行execute查询数据列表出错', err);
                return Promise.reject(err);
            });
    }

    static queryEntityList (params) {
        var self = this;
        var p = oParameters.getParameters(params);
        //变量定义
        var result = {
            "data": [],                                         //数据列表
            "recordsTotal": 0                                  //查询记录总数
        }
        /**
         * 分页数据查询
         */
        var sql = "select " + p["select"] + " from " + params.configs.tableName + " t " + p.where + " " + p.orderBy + p.limit + ";";
        var count_sql = "select count(0) total from " + params.configs.tableName + " t " + p.where;
        //执行SQL
        return Promise.all([
            self.execute(sql, p.parameters),
            self.execute(count_sql, p.parameters)
        ]).then(result=>{
            return Promise.resolve({data: result[0], recordsTotal: result[1]});
        }).catch(e=>{
            console.log('执行execute查询数据列表出错', err);
            return Promise.reject(err);
        });
    }

    static insert (params) {
        var p = [], f = [], s = [];
        for (var i in params.insertion) {
            //参数值
            p.push(params.insertion[i]);
            //字段名称集合
            f.push(i);
            //sql参数化处理符合
            s.push('?');
        }
        var sql = "insert into " + params.configs.tableName + "(" + f.join(',') + ") values(" + s.join(',') + ");";
        return this.execute(sql, p.parameters);
    }

    static insertBatch (params) {
        var p = [], f = [], s = [];
        for (var i in params.insertion) {
            var s2 = [];
            for (var j in params.insertion[i]) {
                if (i == 0) {
                    //字段名称集合，大于0就不需要继续了
                    f.push("`" + j + "`");
                }
                //参数值
                p.push(params.insertion[i][j]);
                //sql参数化处理符合
                s2.push('?');
            }
            //置入
            s.push('(' + s2.join(',') + ')');
        }
        //SQL执行
        var sql = "insert into " + params.configs.tableName + "(" + f.join(',') + ") values" + s.join(',') + ";";
        return this.execute(sql, p);
    }

    static deleteEntity (params) {
        if (!params.hasOwnProperty('keyword') || params.keyword.length == 0) {
            return Promise.reject('需要指定删除条件');
        }
        var p = oParameters.getDeleteParameters(params);
        var sql = "delete from " + params.configs.tableName + " where " + p.where + ";";
        return this.execute(sql, p.parameters);
    }

    static updateEntity (params) {
        var p = oParameters.getUpdateParameters(params);
        var _limit = "";
        if (params.limit && params.hasOwnProperty('limit')) {
            _limit = " limit ?";
            p.parameters.push(params.limit);
        }
        var sql = "update " + params.configs.tableName + " set " + p.set.join(',') + " where " + p.where + _limit + ";";
        return this.execute(sql, p.parameters);
    }

    static statsByAggregate (params) {
        var p = oParameters.getParameters(params);
        var check = {
            "count": "COUNT",
            "sum": "SUM",
            "max": "MAX",
            "min": "MIN",
            "abs": "ABS",
            "avg": "AVG"
        }
        var show = [];
        for (var i in params.aggregate) {
            var c = params.aggregate[i];
            var item = check[c.function.toLowerCase()];
            if (item) {
                show.push(item + "(" + c.field + ") as " + c.name);
            }
        }
        //sql
        var sql = "select " + show.join(',') + " from " + params.configs.tableName + " " + p.where + p.limit + ";";
        return this.execute(sql, p.parameters);
    }
}

module.exports = Onela;