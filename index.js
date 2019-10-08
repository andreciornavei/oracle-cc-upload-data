const axios = require('axios')
const xlsx = require('xlsx')
const querystring = require('querystring')

const OracleCC = {
    API_KEY: "<your-oracle-cc-api-key>",
    API_ENDPOINT: "<your-oracle-cc-endpoint>",
    API_RESOURCE: "<oracle-cc-resource>", //example: "/ccadmin/v1/locations"
    API_RESOURCE_ID_COLUMN: "<oracle-cc-resource-id-identifier>",//example: "locationId"
    FILE_PATH: "<path-to-your-file.ods>",
    entries: [],
    api: undefined,
    TOKEN: "",
    SCHEMA: {
        "SHEET_NAME": {
            "api_column_a": "A",
            "api_column_b": "B",
            "api_column_c": "C"
        }
    },
    initApi: function () {
        this.api = axios.create({
            baseURL: `${this.API_ENDPOINT}`
        })
    },
    treatValue: function (sheet, column, line) {
        if (sheet[`${column}${line}`] !== undefined) {
            return sheet[`${column}${line}`].v;
        } else {
            return ""
        }
    },
    readFile: function () {
        var workbook = xlsx.readFile(this.FILE_PATH);
        workbook.SheetNames.map((sheetName) => {
            if (this.SCHEMA[sheetName] !== undefined) {
                const MODEL = this.SCHEMA[sheetName]
                const sheet = workbook.Sheets[sheetName];
                const ref = sheet["!ref"].split(":")
                const startLine = parseInt(ref[0].replace(/[^0-9]/g, '')) + 1
                const endLine = ref[1].replace(/[^0-9]/g, '')
                for (var i = startLine; i <= endLine; i++) {
                    let object = {};
                    Object.keys(MODEL).map(column => {
                        object[column] = this.treatValue(sheet, MODEL[column], i)
                    })
                    this.entries.push(object)
                }
            }
        })
    }, login: async function () {
        try {
            const response = await this.api.post('/ccadmin/v1/login',
                querystring.stringify({ grant_type: "client_credentials" }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${this.API_KEY}`
                }
            });
            this.TOKEN = response.data.access_token;
        } catch (err) {
            this.TOKEN = null;
        }
    }, getResources: async function (offset) {
        try {
            const response = await this.api.get(this.API_RESOURCE, {
                params: {
                    offset: offset,
                    limit: 1000
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.TOKEN}`
                }
            });
            return response
        } catch (err) {
            return null
        }
    }, deleteResource: async function (resourceId) {
        try {
            const response = await this.api.delete(`${this.API_RESOURCE}/${resourceId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.TOKEN}`
                }
            });
            return response
        } catch (err) {
            return null
        }
    }, postResource: async function (data) {
        try {
            const response = await this.api.post(this.API_RESOURCE, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.TOKEN}`
                }
            });
            return response
        } catch (err) {
            console.log(err)
            return null
        }
    }, run: async function () {
        this.initApi();
        this.readFile();
        await this.login();
        //get all resources
        var resources = [];
        var currentOffset = 0;
        var total = undefined;
        while (currentOffset < total || total == undefined) {
            const response = await this.getResources(currentOffset)
            total = response.data.total
            currentOffset += response.data.items.length
            resources = [...resources, ...response.data.items]
        }
        //iterate resources and remove each one
        resources.map(async (resource) => {
            const deletedResource = await this.deleteResource(resource[this.API_RESOURCE_ID_COLUMN])
            console.log(`DELETED ${resource[this.API_RESOURCE_ID_COLUMN]} => ${deletedResource.statusText}`)
        })
        //create new resources from file data
        //iterate each entrie file data and save one by one
        this.entries.map(async (resource) => {
            const postedResource = await this.postResource(resource)
            console.log(`CREATED => ${postedResource}`)
        })
    }
}

OracleCC.run();