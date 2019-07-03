## FDS-API 

***BETA VERSION - PENDING SECURITY REVIEW, THINGS WILL CHANGE! ***

### Endpoint:

`https://api-noordung.fairdatasociety.org/`

### Methods:

##### Create Account

`curl -XPOST https://api-noordung.fairdatasociety.org/account/create --data "subdomain=test23423423423223223"`

You will receive a token which you must then submit with each requests for authentication.

#### Store Value

Stores a string value.

`curl -XPOST https://api-noordung.fairdatasociety.org/value/store --data "subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&key=test&value=test2" `

#### Retreive Value

Retreives the string.

`curl "https://api-noordung.fairdatasociety.org/value/retrieve?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&key=test"`