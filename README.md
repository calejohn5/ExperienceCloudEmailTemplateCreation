Standard Salesforce functionality doesn’t allow experience users to create, update, or delete their own email templates. They are allowed, however, to use them on Contacts and Sessions.

Created was 3 LWCs named emailTemplateBuilder, emailTemplateList, and emailTemplateRecordDetail. There are also 2 apex classes to handle the backend, named emailTemplateBuilderController and emailTemplateListController.

emailTemplateList - This is the page PM users first view when clicking the tab.  It is a mock record list page to allow users to view and search for existing templates. This LWC contains searchability and pagination as seen below. Users are also allowed to make deletes from the dropdown arrow.
This has potential to be turned into a lightning data-table in the future to allow filtering by fields and changing column width.
![755d7f89-b1ea-4b6d-a7fa-d518807a109a](https://github.com/calejohn5/ExperienceCloudEmailTemplateCreation/assets/34465547/d0a456e4-8f6f-4364-b6ab-f7e573f2d637)


emailTemplateBuilder - This is the modal that allows the users to create a new template. It is located on the top right of the emailTemplateList LWC. Every new ‘Email Template Name' will require that it doesn’t start with a number or contain a special character, this is because the API name is generated (emailTemplateBuilderController) based off of the original name. API names cannot start with a number or contain a special character. However, updates you are allowed numbers/special characters, because the API name has already been generated.
Also you are able to insert merge templates based on the Related Entity Type chosen.
![2e658093-2178-4e16-ae64-3dc6259e9ea1](https://github.com/calejohn5/ExperienceCloudEmailTemplateCreation/assets/34465547/664e0fa6-0b1d-4794-9cf8-3e9305b51e69)

emailTemplateRecordDetail - Users reach this when clicking on an existing record in the list LWC.  It is a simple view of an existing record and allows for updates.  Basically identical to the emailTemplateBuilder component, but updates instead.
![8ccf2ea5-510f-431e-8b49-26a947bf3102](https://github.com/calejohn5/ExperienceCloudEmailTemplateCreation/assets/34465547/0f40d195-9852-4de9-8a15-edbb1a9c0a66)
