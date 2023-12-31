var fields;
var draggedElement;
var mouseDragOffsetX; mouseDragOffsetY;
var imageSetX; var imageSetY;

function initializePage(){
	// Get the element with id="defaultOpen" and click on it  
	document.getElementById('defaultOpen').click();
	fields = 1;

	if(document.getElementById('varImage').firstChild){
		//I have to do this bullshit because apparently divs are pre-initialized with text and I can't iterate through fields otherwise.
		document.getElementById('varImage').removeChild(document.getElementById('varImage').firstChild);
	}
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
	var varList = document.getElementById("varList");
	var count = parseInt(varList.getAttribute('count'));
	//alert(count);
	//alert("value saved! Current count: " + varList.getAttribute('value'));
	newDiv = document.createElement('div');
	newDiv.id = 'var'+count+'container';
	newDiv.style.position = 'absolute';

	element = document.createElement('input');
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

	varList.setAttribute('count', count+1);
}

function removeField(){
	var varList = document.getElementById("varList");
	//alert("varList located");
	if(parseInt(varList.getAttribute('count')) <= 0){
		alert("no textboxes to delete.")
		return;
	}
	varList.setAttribute('count', parseInt(varList.getAttribute('count'))-1)
	var targetId = 'var'+(parseInt(varList.getAttribute('count')))+'container';
	//alert("target's Id: " + targetId);
	removeImage(targetId+'Image');
	document.getElementById(targetId).remove();
	//alert("Target deleted.");
}

function findAndReplaceAll(templateText){
	var varCount = parseInt(document.getElementById("varList").getAttribute('count'));
	//alert(varCount);
	for(var i = 0; i < varCount; i++){
		//alert("replacing %"+i+"% with var"+i);
		//alert("textbox value: " + document.getElementById('var'+i).value);
		templateText = templateText.replaceAll('%'+i+'%', document.getElementById('var'+i).value);
		//alert("Success!");
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

	
	//alert("Type: "+newImage.firstChild.nodeName + " Id: " + newImage.firstChild.id);
	document.getElementById('varImage').appendChild(newImage);
	//alert(newImage.id);
	
	addMouseEventHandlers(newImage.id);
}

function removeImage(imageId){
	document.getElementById(imageId).remove();
}

function addMouseEventHandlers(imageId){
	//alert("Fetching element of id " + imageId);
	var elem = document.getElementById(imageId);
	//alert("adding mouse events to element " + elem.id + " of type " + elem.nodeName);
	
	var node = elem.firstChild;
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
}

function setOffsets(e){
	var imageBoundingBox = document.getElementById('varImage').getBoundingClientRect();
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

function dragElement(e) {
	e = e || window.event;
	console.log('Element: ' + draggedElement + ' X: ' + e.clientX + ' Y: ' + e.clientY);
	console.log('Scroll dist: ' + window.pageXOffset + ' Y: ' + window.pageYOffset);
	document.getElementById(draggedElement).style.left = imageRelativeX(e.clientX - mouseDragOffsetX + window.pageXOffset)+ 'px';
	document.getElementById(draggedElement).style.top = imageRelativeY(e.clientY - mouseDragOffsetY + window.pageYOffset) + 'px';
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
	alert('To call: ' + document.getElementById('varList').getAttribute('count'));
	let node = document.getElementById('varImage').firstChild;
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
	document.getElementById('imageImage').appendChild(imageContainer);
	//alert('success!');
} 
