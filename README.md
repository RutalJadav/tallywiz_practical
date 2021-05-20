# README #

In Project Directory Run:
# 'node server'


In Other Terminal Run to Start Web Server:
# 'wscat -c ws://localhost:8400'


Now Login with User to Web Server:
# '{"type":"login", "userid":1}'


Now For end-to-end Chatting Between Other User, Login Other User with Another Terminal and Run:
# '{"type":"chat", "senderid":1, "receiverid":2, "message":"Hey"}'


Postman Collection For User Data, Add User, Chat History and Chat List:
# 'https://www.getpostman.com/collections/a4db82f8edd736d40c49'


Note: ALL THIS BELOW MENTION API'S ARE IN chat FILE INSIDE CONTROLLERS.


(GET) API to Get All Users List:
# 'localhost:8400/chat/getAllUserList'


(POST) API to Add New User:
# 'localhost:8400/chat/addUser'
--> body: "fullname".


(POST) API to Get Recent Chat History:
# 'localhost:8400/chat/getRecentChatList'
--> body: "senderid".


(POST) API to get Chat Messages History with Specific User:
# 'localhost:8400/chat/getChatHistoryByUser'
--> body: "senderid", "receiverid".