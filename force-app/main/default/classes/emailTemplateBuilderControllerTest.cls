@IsTest(SeeAllData=true)
public with sharing class emailTemplateBuilderControllerTest {

    // Helper method to fetch the first active user with the desired folder.
    private static User getRunAsUserWithFolder() {
        List<User> users = [SELECT Id, FirstName, LastName 
                            FROM User 
                            WHERE IsActive = true 
                            AND Profile.Name = 'EOSI PM Partner User' 
                            LIMIT 99];
        
        for (User u : users) {
            String expectedFolderName = u.FirstName + u.LastName + 'Templates';
            List<Folder> matchingFolders = [SELECT Id FROM Folder WHERE DeveloperName = :expectedFolderName LIMIT 1];
            if (!matchingFolders.isEmpty()) {
                return u;
            }
        }
        return null;
    }


    static testMethod void testValidEmailTemplateCreation() {
        User runAsUser = getRunAsUserWithFolder();
        System.assertNotEquals(null, runAsUser, 'Active user with the required folder should exist.');

        Test.startTest();

        System.runAs(runAsUser) {
            try {
                emailTemplateBuilderController.createEmailTemplate('TestTemplate', 'Contact', 'Test Description', 'Test Subject', 'Test Body');
            } catch(Exception e) {
                System.assert(false, 'Exception should not be thrown: ' + e.getMessage());
            }
        }

        Test.stopTest();

        List<EmailTemplate> templates = [SELECT Id FROM EmailTemplate WHERE Name = 'TestTemplate'];
        System.assertEquals(1, templates.size(), 'Email template should be created successfully.');
    }

    @IsTest
    static void testEmailTemplateCreationWithExistingName() {
        User runAsUser = getRunAsUserWithFolder();
        System.assertNotEquals(null, runAsUser, 'Active user with the required folder should exist.');
    
        Test.startTest();
        System.runAs(runAsUser) {
            // Create the first template
            emailTemplateBuilderController.createEmailTemplate('TestTemplate2', 'Contact', 'Test Description', 'Test Subject', 'Test Body');
            
            // Query to confirm creation
            EmailTemplate firstTemplate = [SELECT Id, Name FROM EmailTemplate WHERE Name = 'TestTemplate2' LIMIT 1];
            System.assertNotEquals(null, firstTemplate, 'First email template should be created successfully.');
    
            // Create a second template with the same name
            emailTemplateBuilderController.createEmailTemplate('TestTemplate2', 'Contact', 'Test Description Again', 'Test Subject Again', 'Test Body Again');
            
            // Query to confirm creation
            List<EmailTemplate> templates = [SELECT Id, Name FROM EmailTemplate WHERE Name = 'TestTemplate2'];
            System.assertEquals(2, templates.size(), 'There should be two templates with the same name.');
    
            // The Ids should be different since they are different records
            System.assertNotEquals(templates[0].Id, templates[1].Id, 'The two email templates should have different Ids.');
        }
        Test.stopTest();
    }
    
    
}