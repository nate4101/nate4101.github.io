
// Api End Points:
const postsEndpoint='https://jsonplaceholder.typicode.com/posts';
const usersEndpoint= 'https://jsonplaceholder.typicode.com/users';
const commentsEndpoint='https://jsonplaceholder.typicode.com/comments';

// No assumptions made, just for more interesting visuals
const maleNames=["Ervin", "Kurtis","Nicholas"];

/**
 * Main Entry Point
 * Steps:
 *  1) Populate Data
 *  2) Process Data
 *  3) Use processed data to generate dynamic html
 */
$(document).ready(async function(){
    // Step 1) Used async as fetch is asynchronous, and I need this done before any code.
    var users=[];
    var posts=[];
    var comments=[];
    await populateData().then(function(response){
        users=response[0];
        posts=response[1];
        comments=response[2];
        console.log(users);
        console.log(posts);
        console.log(comments);
    });
    
    // Step 2) Sort posts by title, add the user.name to the post oject, then sort comments

    // Sort posts array by title
    posts.sort((a,b)=>{
        if(a.title < b.title)
            return -1;
        else 
            return 1;
    });

    // Generate a map for all users, where key is there id, and value is the name.
    const userMap = new Map();
    users.forEach(function(element){
        userMap.set(element.id, element.name);
    });
    
    // For each post, get the user name for that i.d, and sort the comments s.t
    // the i'th index of comments, contains an array of all comment objects for the i'th sorted post
    let sortedComments=[];
    // for each post
    posts.forEach(function(post, postIndex){
        // Set a new property for the post that is the users name
        post.name=userMap.get(post.userId);
        // A new array to contain the comments sorted by index
        sortedComments.push([]);
        // Note: Because of the small data set we can get away with this inefficiency without noticing a performance hit...
        // however for larger data, the comments should be lazy loaded on click, or...
        // delete each comment from comments as we push the comment to sortedComments...
        // that way the array shrinks as we progressively iterate through it.
        comments.forEach(function(comment,commentIndex)
        {
            if(post.id===comment.postId){
               sortedComments[postIndex].push(comment);
            }
        });
    });
    
    // Step 3 Write the dynamic HTML

    // For each post, pass the comment array at that posts index, each to function createPostCommentElement
    posts.forEach(function(post, postIndex){
        createPostCommentElement(post, sortedComments[postIndex]);
    });

    // There is a loading box by default on the page, just destroy it once this content is loaded.
    // Its quick enough that we many 
    var loadingbox = document.getElementById("loading");
    loadingbox.parentNode.removeChild(loadingbox);

    // Thats all she wrote!
});

/**
 * Takes a post object, and array containing comment objects for that post...
 * Generates the post boxes, style, the title, body, name, and favourite button.
 * Calls 
 * @param {object} postObject 
 * @param {object} commentObjectsArray 
 * @
 */
function createPostCommentElement(postObject, commentObjectsArray)
{
let card = document.createElement('div');
card.className="ui fluid raised link purple card";
    // Card title
    let cardTitleContainer = document.createElement('div');
    cardTitleContainer.className="content";
        let cardTitle = document.createElement('div');
        cardTitle.className="center aligned header";
        cardTitle.innerHTML=postObject.title;
    cardTitleContainer.appendChild(cardTitle);
card.appendChild(cardTitleContainer);
    // Card Body
    let cardBodyContainer = document.createElement('div');
    cardBodyContainer.className="content";
        let cardBody = document.createElement('div');
        cardBody.className="description";
            let cardBodyParagraph = document.createElement('p');
            // Modify all \n to <br> tags
            cardBodyParagraph.innerHTML=postObject.body.replace('\n','<br>');
        cardBody.appendChild(cardBodyParagraph);
    cardBodyContainer.appendChild(cardBody);
card.appendChild(cardBodyContainer);
    // Card Extras
    let cardExtraContainer = document.createElement('div');
    cardExtraContainer.className="extra content";
        let authorContainer = document.createElement('div');
        authorContainer.className="right floated author";
            let authorImage = document.createElement('img');
            authorImage.className="ui avatar image";
            // Fun little thing, check if an array contains the first name of the author...
            // if it does, set to a male avatar, if not set to a female avatar...
            authorImage.src= (maleNames.includes(postObject.name.split(" ")[0]))?"https://semantic-ui.com/images/avatar/small/matt.jpg":"https://semantic-ui.com/images/avatar/small/helen.jpg";
        authorContainer.appendChild(authorImage);0
        authorContainer.innerHTML+=postObject.name;
    cardExtraContainer.appendChild(authorContainer);
        let unnecesaryLikeButton = document.createElement('span');
        unnecesaryLikeButton.className="left floated like";
            let likeIcon = document.createElement('i');
            likeIcon.className="like icon";
        unnecesaryLikeButton.appendChild(likeIcon);
        unnecesaryLikeButton.innerHTML+="Favourite";
    cardExtraContainer.appendChild(unnecesaryLikeButton);
card.appendChild(cardExtraContainer);
// Append each comment box.
    let commentContainer = document.createElement('div');
    commentContainer.className="ui message message-list";
    // Inital display of none, jquery.onclick will change this
    commentContainer.style="display: none;";
    let commentContainerHeader = document.createElement('span');
        commentContainerHeader.innerHTML="Comments";
    commentContainer.appendChild(commentContainerHeader);
        // For each comment in the comment array
        // Generate the comment list, then add a <br>
    commentObjectsArray.forEach(function(comment, index){
        let commentContainerElement = createCommentBoxElement(comment)
        commentContainer.appendChild(commentContainerElement); 
        let breakElement = document.createElement('br');
        commentContainer.appendChild(breakElement);
});
card.appendChild(commentContainer);
$('.Posts').append(card);
}

/**
 * Generate the html object containing the comment box.
 * @param {array} comments 
 */
function createCommentBoxElement(commentObject){

    let commentContainer = document.createElement('div');
    commentContainer.className="ui attached tiny message";
        let commentTitle=document.createElement('div');
        commentTitle.className="header";
            let h3 = document.createElement('h3');
            h3.innerHTML=commentObject.name;
        commentTitle.appendChild(h3);
    commentContainer.appendChild(commentTitle);
        let commentBody=document.createElement('div');
        commentBody.className="description";
            let p = document.createElement('p');
            p.innerHTML=convertNewlineToBreakTag(commentObject.body);
        commentBody.appendChild(p);
    commentContainer.appendChild(commentBody);
    commentContainer.innerHTML+="<hr>"+commentObject.email;
    return commentContainer;
}
/**
 * Convert all newline escape characters to <br> in some text
 * @param {string} text 
 */
function convertNewlineToBreakTag(text){
    return text.replace('\n','<br>'); 
}

/**
 * PopulateData()
 * @description 
 * Make Three calls to the api endpoints, store the json results in global variables.
 * fetch() return a promise, we need to await this finish before continuing.
 * 
 * @returns Array containing [[users],[posts],[comments]]
 */
async function populateData(){
    // Arrays to store the data from the endpoints...
    var users=[];
    var posts =[];
    var comments=[];
    await fetch(usersEndpoint)
    .then(response => response.json())
    .then(json => users=json);

    await fetch(postsEndpoint)
    .then(response => response.json())
    .then(json => posts=json);
    
    // With a larger data set, a lazy loading technique might be more viable,
    // and defer this loading into the onlick event.
    await fetch(commentsEndpoint)
    .then(response => response.json())
    .then(json => comments=json);
    return([users,posts,comments]);
}


/**
 * JQuery onClick Event:
 *
 * The contents of a post is contained in a div with class card.
 * Upon clicking on this, find the child of this div who has the class "message-list" and slidetoggle it.
 */
$(".Posts").on("click",'.card',function(){
    console.log("click");
    $(this).find(".message-list").slideToggle(500);
})