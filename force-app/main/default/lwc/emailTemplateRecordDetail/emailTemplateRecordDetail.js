import { LightningElement, wire, api, track } from 'lwc';
import getEmailTemplateById from '@salesforce/apex/emailTemplateListController.getEmailTemplateById';
import updateEmailTemplate from '@salesforce/apex/emailTemplateListController.updateEmailTemplate';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const OBJECTS = {
    'Contact': CONTACT_OBJECT,
    'Opportunity': OPPORTUNITY_OBJECT
};

export default class EmailTemplateRecordDetail extends NavigationMixin(LightningElement) {
    @api recordId;
    @track emailTemplate = { Name: '', RelatedEntityType: '', Description: '', Subject: '', HtmlValue: '' };
    @track selectedFieldApiName;
    @track fieldsOptions = [];
    @track objectApiName;
    emailTemplateHtmlValue = '';


    // Static options for related entity type dropdown
    @track relatedEntityTypeOptions = [
        { label: 'Contact', value: 'Contact' },
        { label: 'Session', value: 'Opportunity' }
    ];

    // Fetching email template details from the server using the wire service
    @wire(getEmailTemplateById, { templateId: '$recordId' })
    wiredEmailTemplate({ data, error }) {
        if (data) {
            this.emailTemplate = data;
            this.relatedEntityType = this.emailTemplate.RelatedEntityType;
            this.emailTemplateHtmlValue = this.emailTemplate.HtmlValue;
            this.objectApiName = OBJECTS[this.relatedEntityType];
        } else if (error) {
            console.error('Error retrieving email template:', error);
        }
    }    

    // Handle the save action, updating the email template
    handleSave() {
        console.log('RelatedEntityType ' + this.emailTemplate.RelatedEntityType);
        console.log('emailTemplateHtmlValue ' + this.emailTemplateHtmlValue);
        let hasError = false;
        let errorMessage = '';
        if (!this.emailTemplate.Name) {
            hasError = true;
            errorMessage += 'Name cannot be blank. ';
        }
        if (!this.emailTemplate.RelatedEntityType) {
            hasError = true;
            errorMessage += 'Related Entity Type cannot be blank.';
        }
        if (hasError) {
            // If there's an error, show a toast with the specific error message and return.
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error',
                }),
            );
            return;
        }
        updateEmailTemplate({ emailTemplateData: this.emailTemplate })
        .then(result => {
            this.emailTemplate = result;
            this.error = undefined;
            // Show toast message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Email Template successfully updated',
                    variant: 'success',
                }),
            );
            // Navigate back to the previous page
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Email_Templates__c'
                }
            });
        })
        .catch(error => {
            console.error('Error updating email template:', error);
            this.error = error;
            // Optional: Show toast message for the error
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.HtmlValue.message,
                    variant: 'error',
                }),
            );
        });
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',  // adjust type as needed
            attributes: {
                name: 'Email_Templates__c'  // replace with the name of the page you want to navigate to
            }
        });
    }

    // When changing any field, we need to create a shallow copy of the email template object and then update the necessary property
    handleNameChange(event) {
        this.emailTemplate = { ...this.emailTemplate, Name: event.target.value };
    }

    handleDescriptionChange(event) {
        this.emailTemplate = { ...this.emailTemplate, Description: event.target.value };
    }

    handleSubjectChange(event) {
        this.emailTemplate = { ...this.emailTemplate, Subject: event.target.value };
    }

    handleBodyChange(event) {
        this.emailTemplate = { ...this.emailTemplate, HtmlValue: event.target.value };
    }
     
    handleRelatedEntityTypeChange(event) {
        this.emailTemplate = { ...this.emailTemplate, RelatedEntityType: event.target.value };
        this.relatedEntityType = event.target.value;
        this.objectApiName = OBJECTS[this.relatedEntityType];
    }    

    // Same merge functionality from emailTemplateBuilder LWC
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.fieldsOptions = this.getFieldsOptions(data);
            if(this.relatedEntityType === 'Opportunity') {
                this.addFieldToOptions('FirstName', 'First Name');
                this.addFieldToOptions('LastName', 'Last Name');
            }
        } else if (error) {
            this.showErrorMessage('Error fetching object information');
        }
    }

    addFieldToOptions(apiName, label) {
    this.fieldsOptions.push({
        value: apiName,
        label: label
    });

    // Sort again after adding new fields
    this.fieldsOptions.sort((a, b) => a.label.localeCompare(b.label));
    } 

    // Extracting field options from the object's metadata
    getFieldsOptions(objectInfo) {
        const fieldInfos = objectInfo.fields;
        const fieldsArray = Object.keys(fieldInfos).map(fieldApiName => ({
            label: fieldInfos[fieldApiName].label,
            value: fieldApiName
        }));
    
        // Sort by label
        fieldsArray.sort((a, b) => a.label.localeCompare(b.label));
        
        return fieldsArray;
    }

    // Handle field selection for merge operation in the rich text editor
    handleFieldSelection(event) {
        this.selectedFieldApiName = event.detail.value;
        const inputElement = this.template.querySelector('lightning-input-rich-text');
        
        let prefix = 'Recipient';
        if ((this.relatedEntityType === 'Opportunity' || this.relatedEntityType === 'Session') 
            && this.selectedFieldApiName !== 'FirstName' && this.selectedFieldApiName !== 'LastName') {
            prefix = 'Opportunity';
        }

        if (inputElement && this.selectedFieldApiName) {
            const startPos = inputElement.selectionStart;
            const endPos = inputElement.selectionEnd;
            const selectedFieldText = `{{{${prefix}.${this.selectedFieldApiName}}}}`;
            inputElement.setRangeText(selectedFieldText, startPos, endPos, 'end');
        }
    }
}