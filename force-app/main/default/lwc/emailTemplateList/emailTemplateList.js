import { LightningElement, wire, track } from 'lwc';
import getEmailTemplates from '@salesforce/apex/emailTemplateListController.getEmailTemplates';
import deleteEmailTemplate from '@salesforce/apex/emailTemplateListController.deleteEmailTemplate';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const PAGE_SIZE = 30; // Number of records displayed per page

export default class EmailTemplateList extends NavigationMixin(LightningElement) {
  @track emailTemplates = [];  // Holds the email templates for the current page
  @track allEmailTemplates = [];  // Holds all the email templates fetched from server
  @track currentPage = 1;  // Default to the first page
  @track isModalOpen = false; // Track if modal is open or not
  @track searchTerm = ''; // Track the search term entered by the user
  totalEmailTemplates = 0;  // Total number of email templates
  
  wiredResult = {}; // Store the result of the wire service

  // Get Email Templates
  @wire(getEmailTemplates)
    wiredEmailTemplates(result) {
        this.wiredResult = result; 
        const { data, error } = result;
        if (data) {
            this.totalEmailTemplates = data.length;
            this.allEmailTemplates = data;
            this.filterEmailTemplates(); // Call this after setting the allEmailTemplates
        } else if (error) {
            console.error('Error retrieving email templates:', error);
        }
    }

  // Utility method to get email templates for the current page
  getEmailTemplatesForCurrentPage() {
    const startIndex = (this.currentPage - 1) * PAGE_SIZE;
    const endIndex = this.currentPage * PAGE_SIZE;
    return this.allEmailTemplates.slice(startIndex, endIndex);
  }

  // Method to navigate to specific record detail page
  navigateToRecordDetail(event) {
    event.preventDefault();
    const recordId = event.currentTarget.dataset.recordId;
    this[NavigationMixin.Navigate]({
      type: 'comm__namedPage',
      attributes: {
          name: 'Email_Template_Record_Detail_Subpage__c'
      },
      state: {
          recordId: recordId
      }
    });
  }

  // Handle "next" pagination action
  handleNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.emailTemplates = this.getEmailTemplatesForCurrentPage();
    }
  }

  // Handle "previous" pagination action
  handlePrevious() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.emailTemplates = this.getEmailTemplatesForCurrentPage();
    }
  }

  // Check if pagination is needed
  get hasPagination() {
    return this.totalEmailTemplates > PAGE_SIZE;
  }

  // Calculate the total number of pages
  get totalPages() {
    return Math.ceil(this.totalEmailTemplates / PAGE_SIZE);
  }

  // Check if "next" button should be available
  get hasNext() {
    return this.currentPage < this.totalPages;
  }

  // Check if "previous" button should be available
  get hasPrevious() {
    return this.currentPage > 1;
  }

  // Handle actions on each row, like delete
  handleRowAction(event) {
    event.preventDefault();
    const recordId = event.currentTarget.dataset.recordId; // Accessing the recordId from the lightning-button-menu's data attribute

    let actionName = event.detail.value;  // Get the action from the clicked menu item (i.e., "delete")

    switch (actionName) {
        case 'delete':
            this.deleteRow(recordId); // Use the recordId directly to delete
            break;
        default:
            break;
    }
  }

  // Delete a specific email template
  deleteRow(rowId) {
    deleteEmailTemplate({ templateId: rowId })
    .then(result => {
        // If the deletion was successful
        if (result === 'success') {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Email Template Deleted Successfully',
                    variant: 'success'
                }),
            );
            // Refresh the page after successfull delete
            refreshApex(this.wiredResult);
            // return this.refreshComponent();
        } else {
            // If there was an error
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting Email Template',
                    message: result,
                    variant: 'error'
                }),
            );
        }
    })
    .catch(error => {
        // Handle any unexpected error
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error deleting Email Template',
                message: error.body.message,
                variant: 'error'
            }),
        );
    });
  }

  // Add these two methods at the end of the class
  handleOpenModal() {
      this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
  }

  handleSearchInputChange(event) {
    this.searchTerm = event.target.value.toLowerCase(); // store the search term (in lowercase for case insensitive search)
    this.filterEmailTemplates(); // apply the filter
  }

  // Method to filter email templates based on the search term
  filterEmailTemplates() {
    // Using a simple includes() check to filter the email templates based on the name
    this.emailTemplates = this.allEmailTemplates.filter(template => 
        template.Name.toLowerCase().includes(this.searchTerm)
    );
  }
}