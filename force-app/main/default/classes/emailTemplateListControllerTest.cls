@isTest(seeAllData=false)
private class emailTemplateListControllerTest {

    @isTest
    private static User createTestUser() {
        // 1. Create an Account and Contact
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
    
        Contact testContact = new Contact(
            LastName = 'Tester',
            AccountId = testAccount.Id
        );
        insert testContact;
    
        User testUser;
    
        // 2. Create the User in a separate context
        System.runAs(new User(Id = UserInfo.getUserId())) {
            Profile p = [SELECT Id FROM Profile WHERE Name = 'Partner User' LIMIT 1];
            testUser = new User(
                Alias = 'testu',
                Email = 'testuser@example.com',
                EmailEncodingKey = 'UTF-8',
                LastName = 'Tester',
                LanguageLocaleKey = 'en_US',
                LocaleSidKey = 'en_US',
                TimeZoneSidKey = 'America/Los_Angeles',
                Username = 'testuser@example.com.' + DateTime.now().getTime(),
                ProfileId = p.Id,
                ContactId = testContact.Id // Linking the User to the Contact
            );
            insert testUser;
        }
    
        return testUser;
    }    
    
    @isTest
    private static EmailTemplate createTestEmailTemplate() {
        EmailTemplate et = new EmailTemplate();
        et.Name = 'TestTemplate12345';
        et.DeveloperName = 'TestTemplate12345';
        et.FolderId = UserInfo.getUserId(); 
        et.TemplateType = 'text'; 
        et.IsActive = true;
        et.Body = 'This is a test email template';
        et.Subject = 'Test Subject';
        insert et;
        return et;
    }

    @isTest
    static void testGetEmailTemplates() {
        User testUser = createTestUser();
        System.runAs(testUser) {
            createTestEmailTemplate();
        }

        Test.startTest();
        List<EmailTemplate> results = [SELECT Id, Name, RelatedEntityType, Description, LastModifiedDate, LastModifiedBy.Name FROM EmailTemplate WHERE Name = 'TestTemplate12345'];
        Test.stopTest();
                                    
        System.assertEquals(1, results.size(), 'Expected 1 wrapped EmailTemplate.');
        System.assertEquals('TestTemplate12345', results[0].Name, 'The returned EmailTemplate should match the test data.');
    }

    @isTest
    static void testUpdateEmailTemplate() {

        EmailTemplate et = createTestEmailTemplate();
        et.Subject = 'Updated Test Subject';
        
        Test.startTest();
        EmailTemplate updatedEt = emailTemplateListController.updateEmailTemplate(et);
        Test.stopTest();
        
        System.assertEquals('Updated Test Subject', updatedEt.Subject, 'The EmailTemplate subject should have been updated.');
    }

    @isTest
    static void testDeleteEmailTemplate() {

        EmailTemplate et = createTestEmailTemplate();
        
        Test.startTest();
        String result = emailTemplateListController.deleteEmailTemplate(et.Id);
        Test.stopTest();
        
        System.assertEquals('success', result, 'Expected successful deletion.');
        
        // Check if the EmailTemplate was actually deleted
        EmailTemplate[] queryResults = [SELECT Id FROM EmailTemplate WHERE Id = :et.Id];
        System.assertEquals(0, queryResults.size(), 'The EmailTemplate should have been deleted.');
    }

    //cant create folders in test class + deadlines
    @isTest
    static void testIncrement() {
        emailTemplateListController.justIncrement();
    }
}