
One most important detail you need to take care is that the code you write is coherent with my code writing style.
And if there are best practices that are not respected in my existing code, you will ignore those and help me to apply the best practices.
For data structure for the api, you will not assume or predefine any structure. You will always fetch the data structure from the api using a http call to the api.

# Authentication
The login is done using /api/request-login endpoint.
For testing you call use those credentials to exchange for a token:
{
    "email": "ryanrasoarahona@gmail.com",
    "password": "ryanrasoarahona1@"
}
In case an access to a coach is needed use the following:
{
    "email": "coach@localhost.com",
    "password": "coachcoach1@"
}

# Complex tasks
For complex and lengthy tasks, you will make sure to create a dynamic and smartly crafted todo list.


# User privileges
In case some features requires the user privileges (free, hoylt, gursky, smiley, alonzo), you will check at the user.renewable_id property for it. Ensure that the user has been loaded (or use userObservable from the content service).

# Code refactoring

For refactoring code, you will ensure every scss are correctly fetched and organized. If you can find better writing method for a better modularity of the content, you can apply. If possible write scss in a nested way.
The components will be placed inside the src/app/components directory.

# Backend

In case you require a backend connection, you will use this endpoint: `http://localhost:8080/docs/api` to fetch the docs and find the suitable endpoints.
It is also important to you to confirm with me some choice if you are not sure about yourself.

# Styles and HTML templates

You will make sure the styling you use are coherent with the page I have written. You will keep to use same nomenclature, same structure, and same design patterns throughout the application. Note that this application is for mobile, you will not add a mouse "hover" css-pseudo selector.

# Typescript

Unless specified, you will always generate minimum required code for each feature implementation.