const Onela = require("./onela");

/**
 * 模型的基类，负责该模型的crud基本操作
 */
class BaseModelManager {

    static getActionManager () {
        if (!(this.action_manager)){
            this.action_manager = Onela.getActionManager(this.configs.engine);
        }
        return this.action_manager;
    }

    static getEntity (params) {
        // let options = Object.assign({}, params);
        params.configs = this.configs;
        return this.getActionManager().queryEntity(params);
    }

    static getEntityList(params) {
        params.configs = this.configs;
        return this.getActionManager().queryEntityList(params);
    }

    static insertEntity (entity) {
        let p = {};
        entity.configs = this.configs;
        for (let field of  this.configs.fields) {
            if (field.name in entity) {
                p[field.name] = entity[field.name];
            } else {
                let default_value = null;
                if (field.default === undefined) {
                    throw new Error(`field:${field.name} required`);
                }
                if (field.default instanceof Function ){
                    default_value = field.default();
                } else {
                    default_value = field.default;
                }
                p[field.name] = default_value;
            }
        }
        return this.getActionManager().insert({insertion: p, configs: this.configs});
    }

    static insertBatch (entity_list) {
        let insert_list = [];
        for (let entity of entity_list) {
            let insert_obj = {};
            for (let field of this.configs.fields) {
                if (field.name in entity) {
                    insert_obj[field.name] = entity[field.name];
                } else {
                    let default_value = null;
                    if (field.default === undefined) {
                        throw new Error(`field:${field.name} required`);
                    }
                    if (field.default instanceof Function ){
                        default_value = field.default();
                    } else {
                        default_value = field.default;
                    }
                    insert_obj[field.name] = default_value;
                }
            }
            insert_list.push(insert_obj);
        }
        // console.log(insert_list);
        return this.getActionManager().insertBatch({insertion: insert_list, configs: this.configs});
    }

    static deleteEntity (params) {
        params.configs = this.configs;
        return this.getActionManager().deleteEntity(params);
    }


    static updateEntity (params) {
        if (!params.hasOwnProperty('keyword') || params.keyword.length == 0) {
            return Promise.reject('paras.keyword更新条件（数组）必须存在条件');
        }
        params.configs = this.configs;
        return this.getActionManager().updateEntity(params);
    }

    /**
     * [{update: {}, keyword: []]
     * @param {Array<Object>} update_list 
     */
    static updateBatch (update_list) {
        var self = this;
        let p = Promise.resolve();
        for (let update_info of update_list) {
            p.then(self.updateEntity(update_info));
        }
    }

    static getEntityByAggregate (params) {
        params.configs = this.configs;
        return this.getActionManager().statsByAggregate(params);
    }
}

BaseModelManager.action_manager = null; // 连接初始化后绑定到这里来
BaseModelManager.configs = {
    fields: [],
    tableName: '',
    engine: "default"
};

module.exports = BaseModelManager;