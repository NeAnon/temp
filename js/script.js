var fields;
var draggedElement;
var mouseDragOffsetX; var mouseDragOffsetY;
var imageSetX; var imageSetY;
var contextMenuTarget;

function initializePage(){
	// Get the element with id="defaultOpen" and click on it  
	document.getElementById('defaultOpen').click();
	fields = 1;

	while(document.getElementById('inputImages').firstChild){
		//I have to do this bullshit because apparently divs are pre-initialized with text and I can't iterate through fields otherwise.
		document.getElementById('inputImages').removeChild(document.getElementById('inputImages').firstChild);
	}
	while(document.getElementById('inputList').firstChild){
		//I have to do this bullshit because apparently divs are pre-initialized with text and I can't iterate through fields otherwise.
		document.getElementById('inputList').removeChild(document.getElementById('inputList').firstChild);
	}
	document.addEventListener("contextmenu", (e) => {e.preventDefault();});
}

function openTab(evt, TabName) {
	// Declare all variables
	var i, tabcontent, tabs;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tabs" and remove the class "active"
	tabs = document.getElementsByClassName("tabs");
	for (i = 0; i < tabs.length; i++) {
		tabs[i].className = tabs[i].className.replace("active", "");
	}


	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(TabName).style.display = "block";
	evt.currentTarget.className += "active";
}

//I don't know if I should trust this function. I might switch over to FileSaver.js in case of compat issues.
//Update 03-01-2024 - Works so far. lmao.
function download(filename, content) {
	var element = document.createElement('a');                                                      //Create a new element (a hyperlink to a file)
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));   //The file contents are of a plaintext type
	element.setAttribute('download', filename);                                                     //And set to be downloaded upon submitting the form
	element.setAttribute('target', '_blank');    element.setAttribute('rel', "noopener noreferrer");    

	//This element is temporarily placed in the browser body, activated, and then removed.
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
} 

function addField(){
	//alert("Started...");
	var varList = document.getElementById("inputList");
	var count = 0;
	//alert(count);
	//alert("value saved! Current count: " + varList.getAttribute('value'));
	newDiv = document.createElement('div');
	//Find a free id
	while(document.getElementById('var' + count + 'container') != null){count++;}
	newDiv.id = 'var'+count+'container';
	newDiv.style.position = 'absolute';

	let element = document.createElement('input');
	element.type = "text";
	element.id= 'var'+(count);
	element.size=10;
	//alert("child created.");
	newDiv.appendChild(element);

	//alert("Child textbox added, id: " +(element.getAttribute('id')));
	
	//linebreak = document.createElement("br");
	//newDiv.appendChild(linebreak);
	newDiv.setAttribute('posX', 0);
	newDiv.setAttribute('posY', 0);
	varList.append(newDiv);
	addImage(newDiv.id);
	//alert(newDiv.posX);

}


//This all needs to be reworked!!
function findAndReplaceAll(templateText){
	let varList = document.getElementById('inputList');
	let currnode = varList.firstChild;
	//alert(varCount);
	while(currnode){
		console.log(currnode.nodeName);
		let varName = currnode.firstChild.id.substring(3);
		console.log(varName);
		templateText = templateText.replaceAll('%'+varName+'%', document.getElementById('var'+varName).value);
		//alert("Success!");
		currnode = currnode.nextSibling;
	}
	//alert(templateText);
	return templateText;
}    

function addImage(sourceDivId){
	//Nooooo you can't just pass this shit directly, you have to do this funny
	//fucking roundabout shit to read any values you set on a div
	let sourceDiv = document.getElementById(sourceDivId);
	newImage = document.createElement('div');
	//newImage.setAttribute('referenceId', sourceDiv.id);
	//newImage.setAttribute('id', sourceDiv.id + 'Image');
	//IM LOSING MY FUCKInG MIND WITH THIS LANGUAGE WHY DOES EVERYTHING FAIL SILENTLY
	newImage.setAttribute('posX', sourceDiv.getAttribute('posX'));
	newImage.setAttribute('posY', sourceDiv.getAttribute('posY'));
	newImage.setAttribute('referenceId', sourceDiv.getAttribute('id'));
	newImage.setAttribute('id', sourceDiv.id+'Image');
	
	newImage.className = 'image';
	newImage.style.position = 'absolute';

	newImage.appendChild(sourceDiv.firstChild.cloneNode(false));
	newImage.firstChild.setAttribute('id', sourceDiv.firstChild.id+'Image');
	newImage.firstChild.value = 	sourceDiv.firstChild.id.substring(3);
	newImage.firstChild.style.color = 'rgba(0,0,0,0)';

	
	//alert("Type: "+newImage.firstChild.nodeName + " Id: " + newImage.firstChild.id);
	document.getElementById('inputImages').appendChild(newImage);
	//alert(newImage.id);
	
	addMouseEventHandlers(newImage.id);
}

function removeImage(imageId){
	document.getElementById(imageId).remove();
}

function addMouseEventHandlers(imageId){
	//alert("Fetching element of id " + imageId);
	let elem = document.getElementById(imageId);
	//alert("adding mouse events to element " + elem.id + " of type " + elem.nodeName);
	
	let node = elem.firstChild;
	while(node){
		node.addEventListener("mousedown", (e) => {e.preventDefault()});
		node = node.nextSibling;
	}

	elem.addEventListener("mousedown", (e) => {
		draggedElement = elem.id;
		onmousemove = dragElement;
		onmouseup = stopDrag;
		setOffsets(e);
	})

	elem.addEventListener("contextmenu", customContextMenu);
}

function setOffsets(e){
	var imageBoundingBox = document.getElementById('inputImages').getBoundingClientRect();
	var draggableBoundingBox = document.getElementById(draggedElement).getBoundingClientRect();
	console.log('imageBoxX: ' + imageBoundingBox.x + ' imageBoxY: ' + imageBoundingBox.y);
	mouseDragOffsetX = e.clientX - draggableBoundingBox.x;
	mouseDragOffsetY = e.clientY - draggableBoundingBox.y;
	imageSetX = imageBoundingBox.x;
	imageSetY = imageBoundingBox.y;
	console.log('MDOX: ' + mouseDragOffsetX + ' MDOY: ' + mouseDragOffsetY);
}

function imageRelativeX(boxLeft){
	return boxLeft > imageSetX ? boxLeft : imageSetX ;
}

function imageRelativeY(boxTop){
	return boxTop > imageSetY ? boxTop : imageSetY;
}

function adjustCursorOffsetX(cursorX){
	return cursorX + window.scrollX;
}

function adjustCursorOffsetY(cursorY){
	return cursorY + window.scrollY;
}

function dragElement(e) {
	console.log('Element: ' + draggedElement + ' X: ' + e.clientX + ' Y: ' + e.clientY);
	console.log('Scroll dist: ' + window.pageXOffset + ' Y: ' + window.pageYOffset);
	document.getElementById(draggedElement).style.left = imageRelativeX(adjustCursorOffsetX(e.clientX - mouseDragOffsetX))+ 'px';
	document.getElementById(draggedElement).style.top = imageRelativeY(adjustCursorOffsetY(e.clientY - mouseDragOffsetY)) + 'px';
	//style.top = e.clientY +'px';
}

function stopDrag(e){
	let draggable = document.getElementById(draggedElement);
	let origin = document.getElementById(draggable.getAttribute('referenceId'));

	//Using the actual style values to get/set positions, since these are going to be the most accurate to the design appearance.
	origin.setAttribute('posX', draggable.style.left);
	origin.setAttribute('posY', draggable.style.top);

	//set final positions
	origin.style.left = origin.getAttribute('posX');
	origin.style.top = origin.getAttribute('posY');

	onmousemove = null;
	onmouseup = null;
	draggedElement = "";
}

function callAllImages(){
	alert('calling all images!');
	let node = document.getElementById('inputImages').firstChild;
	alert('first Node found');
	while(node){
		alert("element " + node.id + " exists." );
		alert("its type is " + node.nodeName);
		alert(	"\nposition X: " + node.getAttribute('posX')+
				"\nposition Y: " + node.getAttribute('posY')+ 
				"\nreferenced element: " + node.getAttribute('referenceId'));
		node = node.nextSibling;
	}
}

function uploadImg(){
	var img = document.createElement('img');
	img.src = window.URL.createObjectURL(document.getElementById('image_source').files[0]);
	img.width = 200;
	var imageContainer = document.createElement('div');
	imageContainer.id = 'newImgContainer';
	imageContainer.appendChild(img);
	document.getElementById('visualImages').appendChild(imageContainer);
	//alert('success!');
} 
/**************************************************************************************** */
//										
/**************************************************************************************** */

function customContextMenu(e){
	e.preventDefault();
	//alert("Brought up context menu of " + e.target.nodeName + " type element.");
	contextMenu = document.getElementById("contextMenu");
	contextMenu.style.left = adjustCursorOffsetX(e.clientX) + 'px';
	contextMenu.style.top = adjustCursorOffsetY(e.clientY) + 'px';
	contextMenu.style.visibility = "visible";
	contextMenuTarget = e.target;

	//Context menu options. contextMenuTarget determines the right-clicked element
	if(e.target.nodeName.toLowerCase() == "input"){
		//width changed for default text input fields
		let elem = document.createElement("button");
		elem.innerText = "Change width of input field";
		elem.addEventListener('click', (e)=>{
			//I'll make this better later I promise (lies)
			let inputLength = parseInt(prompt("Character length of input field: ", contextMenuTarget.size));
			contextMenuTarget.size = inputLength;
			//relatedInput(contextMenuTarget.id);
			document.getElementById(relatedInput(contextMenuTarget.id)).size = inputLength;
		});
		contextMenu.appendChild(elem);
	}
	if(e.target.nodeName.toLowerCase() == "input"){
		//width changed for default text input fields
		let elem = document.createElement("button");
		elem.innerText = "Rename referenced variable";
		elem.addEventListener('click', (e)=>{
			// 			The 'getElementById().id' is necessary. Otherwise the page has no idea what the return type is (and we ensure the object actually exists).
			let newVarName = prompt("New variable name: ", document.getElementById(relatedInput(contextMenuTarget.id)).id.substring(3)/*'var'.length()*/);
			if(newVarName!=null){
				rebind(contextMenuTarget.id, newVarName);
			}
			contextMenu.style.visibility = "hidden";
		});
		contextMenu.appendChild(elem);
	}
	if(e.target.nodeName.toLowerCase() == "input"){
		//Toggle variable name visibility
		let elem = document.createElement("button");
		elem.innerText = "Toggle variable name visibility";
		elem.addEventListener('click', (e)=>{
			contextMenuTarget.style.color = (contextMenuTarget.style.color == 'rgba(0, 0, 0, 0)' ? 'rgba(0, 0, 0)' : 'rgba(0, 0, 0, 0)');
		});
		contextMenu.appendChild(elem);
	}

	//Deletion (this should probably be on the bottom of the stack)
	let elem = document.createElement("button");
	elem.innerText = "Delete";
	elem.addEventListener('click', (e) => {
		if(!e.shiftKey && !confirm("Are you sure?")){
			return;
		}
		else{
			document.getElementById(relatedInput(contextMenuTarget.id)).parentElement.remove();
			contextMenuTarget.parentElement.remove();
			contextMenu.style.visibility = "hidden";
		}
	})
	elem.style.color = '#aa0000';
	contextMenu.appendChild(elem);

	//Remove context menu on clicking away
	document.addEventListener("mousedown", (e) => {
		if(contextMenu.getBoundingClientRect().x > e.clientX || contextMenu.getBoundingClientRect().x + contextMenu.getBoundingClientRect().width < e.clientX)
		{contextMenu.style.visibility = 'hidden'; destroyAllContextMenuOptions();} //x within box check
		else if(contextMenu.getBoundingClientRect().y > e.clientY || contextMenu.getBoundingClientRect().y + contextMenu.getBoundingClientRect().height < e.clientY)
		{contextMenu.style.visibility = 'hidden'; destroyAllContextMenuOptions();} //y within box check
	});
}

function relatedInput(inImageId){
	if(document.getElementById(inImageId).parentElement.getAttribute('referenceId') == null){ return; }
	return document.getElementById(document.getElementById(inImageId).parentElement.getAttribute('referenceId')).firstChild.id;
}

function destroyAllContextMenuOptions(){
	cmenu = document.getElementById("contextMenu");
	node = contextMenu.firstChild;
	while(node){
		cmenu.removeChild(node);
		node = contextMenu.firstChild;
	}
}

function rebind(inputId, newTag){
	if(document.getElementById('var'+newTag)){
		alert("An input field with this tag already exists!");
		return;
	}
	else{
		document.getElementById(relatedInput(inputId)).id = 'var'+newTag;
		document.getElementById(relatedInput(inputId)).parentElement.id = 'var'+newTag+'container';
		document.getElementById(inputId).parentElement.setAttribute('referenceId', 'var'+newTag+'container');
		document.getElementById(inputId).parentElement.id = 'var'+newTag+'containerImage';
		document.getElementById(inputId).value = newTag;
		document.getElementById(inputId).id = 'var'+newTag+'Image'
	}
}




