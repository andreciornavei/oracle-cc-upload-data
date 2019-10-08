# oracle-cc-upload-data
A script to upload data to Oracle Commerce Cloud from file

**In this script you can configure a Oracle Commerce Cloud account to be able to upload your file data**

Be sure to fill correcly the fields below:

**API_KEY** = Your Oracle CC API KEY provided to access your account;

**API_ENDPOINT** = The URL provided to you access your API in Oracle CC;

**API_RESOURCE** = The Resource you want to update when execute the script;

**API_RESOURCE_ID_COLUMN** = The ID field informed in the Resource API documentation;

**FILE_PATH** = The full path to the file you want to upload ;

**SCHEMA** = An Object where each key is named with each sheet you want to upload, and its content its a value pair where the key is the field name informed in the Resource API documentation and the value is the column letter represented in your sheet;

---

Read the documentation of Oracle Commerce Cloud API at https://docs.oracle.com/en/cloud/saas/commerce-cloud/cxocc/

**CAUTION:** this script delete all existing resources before upload file data

---

After configure the properties you can run the script with npm:

> npm start
