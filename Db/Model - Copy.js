let path = require("path"),
    fs = require("fs"),
    { slice } = require("../utils/utils");
    
function exporter(dirPath, name) {
    let classThis;
    class Model {
        constructor(dirPath, name) {
            this.dirPath = dirPath,
                this.name = name;
            if (!path.isAbsolute(dirPath))
                throw new Error("The `dirPath` argument must be an absolute path");

            if ((!name) || (name == ""))
                throw new Error("The Argument name be a valid string");
            if (!fs.existsSync(dirPath))
                fs.mkdirSync(dirPath);
            if ((!fs.statSync(dirPath).isDirectory()))
                throw new Error("The specified path is not a directory or not exists");
            let collectionPath = path.join(dirPath, `${name}.json`),
                fileExists = fs.existsSync(collectionPath);
            this.collectionPath = collectionPath;
            classThis = this;
            if (!fileExists)
                fs.writeFileSync(collectionPath, "[]");
            try {
                // console.log(fs.readFileSync(classThis.collectionPath).toString());
                this.getDataAsJson();
            } catch (error) {
                console.log("can not parse the collection as json")
                fs.writeFileSync(collectionPath, "[]");
            }

            // console.log(this)

        }

        generateId() {
            let id = "", lengther = [27, 31, 34, 39, 43, 49, 13],
                callStack = 0,
                abc = ["abcdefghijklmnopqrstuvwxyz", '123456789', "=*&%$#"],
                matchId = this.matchId;
            function generate() {
                for (let i = 0; i <= ((callStack > 1) ? lengther[parseInt(Math.random() * lengther.length)] : 24); i++) {
                    let chs = abc[parseInt(Math.random() * abc.length)],
                        ch = chs[parseInt(Math.random() * chs.length)];
                    id += ch;
                }
                callStack += 1;
                let matched = matchId(id);
                if (matched)
                    return generate();
                return id;
            }
            return generate();
        };

        matchId(id) {
            let data = JSON.parse(fs.readFileSync(classThis.collectionPath).toString()),
                opArr = {};
            return call();
            function call() {
                opArr = slice(data, (opArr.i ? opArr.i : 0))
                for (let i = 0; i < opArr.arr.length; i++) {
                    if (opArr.arr[i].id == id)
                        return true;
                    if (i == (opArr.arr.length - 1))
                        return call();
                }
                return false;
            }
        };

        getOne(filter) {
            let data = this.getDataAsJson(),
                opArr = {};
            if ((!filter) || typeof filter !== "object" || (typeof filter === "object" && Object.keys(filter).length == 0))
                return data;
            return call()
            function call() {
                opArr = slice(data, (opArr.i ? opArr.i : 0));
                for (let i = 0; i < opArr.arr.length; i++) {
                    let doc = opArr.arr[i],
                        found = false,
                        stack = 0,
                        keys = Object.keys(filter);
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        if (doc[key] === filter[key])
                            stack++;
                        if (stack === (keys.length))
                            found = true;
                    }
                    if (found)
                        return (doc);
                    if (i == (opArr.arr.length - 1))
                        return call();
                }
                return null;
            }
        }

        get(filter) {
            let returnArr = [],
                data = this.getDataAsJson(),
                opArr = {};
            if ((!filter) || typeof filter !== "object" || (typeof filter === "object" && Object.keys(filter).length == 0))
                return data;
            return call()
            function call() {
                opArr = slice(data, (opArr.i ? opArr.i : 0));
                for (let i = 0; i < opArr.arr.length; i++) {
                    let doc = opArr.arr[i],
                        found = false,
                        stack = 0,
                        keys = Object.keys(filter);
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        if (doc[key] === filter[key])
                            stack++;
                        if (stack === (keys.length - 1))
                            found = true;
                    }
                    if (found)
                        returnArr.push(doc);
                    if (i == (opArr.arr.length - 1))
                        return call();
                }
                return returnArr;
            }
        }

        getById(id) {
            let data = this.getDataAsJson(),
                opArr = {};
            return call();
            function call() {
                opArr = slice(data, (opArr.i ? opArr.i : 0));
                for (let i = 0; i < opArr.arr.length; i++) {
                    let doc = opArr.arr[i];
                    if (doc.id === id)
                        return doc;
                    if (i === (doc.length - 1))
                        return call();
                }
                return null;
            }
        }

        updateById(id, data) {
            let Collection_data = this.getDataAsJson(),
                opArr = {},
                ind = 0;
            return call();
            function call() {
                opArr = slice(Collection_data, (opArr.i ? opArr.i : 0));
                for (let i = 0; i < opArr.arr.length; i++) {
                    let doc = opArr.arr[i];
                    if (doc.id === id) {
                        Collection_data[ind] = { ...Collection_data[ind], ...data };
                        return {
                            save: () => {
                                return new Promise((resolve, reject) => {
                                    fs.promises.writeFile(classThis.collectionPath, JSON.stringify(Collection_data)).then(_e => resolve(true)).catch(err => {
                                        reject(err);
                                    });
                                });
                            }
                        };
                    }
                    ind++;
                    if (i === (opArr.arr.length - 1))
                        return call();
                }
                return false;
            }
        }

        deleteById(id) {
            let Collection_data = this.getDataAsJson(),
                opArr = {},
                pusher = []
            return call();
            function call() {
                opArr = slice(Collection_data, (opArr.i ? opArr.i : 0));
                for (let i = 0; i < opArr.arr.length; i++) {
                    let doc = opArr.arr[i];
                    if (doc.id === id)
                        continue;
                    pusher.push(doc);
                    if (i === (opArr.arr.length - 1))
                        return call();
                }
                fs.writeFileSync(classThis.collectionPath, JSON.stringify(pusher));
                return true;
            }
        }

        getDataAsJson() {
            // console.log(this)
            let data = JSON.parse(fs.readFileSync(classThis.collectionPath).toString());
            return data;
        }
        /**
         * 
         * @param {object} data 
         *  
         * */
        create(data) {
            // console.log(classThis.collectionPath)
            let existingCollectionData = this.getDataAsJson();
            // console.log("got data")
            existingCollectionData.push({ ...data, id: this.generateId() });
            return {
                save: async () => {
                    // console.log("saving")
                    let s = await fs.promises.writeFile(classThis.collectionPath, JSON.stringify(existingCollectionData)).then(_ => (true)).catch(_err => (_err));
                    return s
                }
            }
        }
    }
    return new Model(dirPath, name);
}


module.exports = exporter;