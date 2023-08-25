# homedrop

# deployed URL
https://e9xoe9tvb9.execute-api.us-east-1.amazonaws.com/dev/home

# endpoits
  /auth - Authenticate a user with “phone” and return a JWT token.This JWT token will be further used to do the below API calls.
  
  /send-report - This API will take JWT token in headers and phone/email in body and return success. It’s task is to dynamically generate a PDF with contents (Current Date and Time, and user 
                 phone number) and send it to the given phone/email

  /get-history - Get all sent history of that particular user (identified by the JWT token)
