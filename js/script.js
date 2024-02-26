var fields;
var draggedElement;	var trackedElement;
//Offsets for when an element is pressed
var mouseDragOffsetX; var mouseDragOffsetY;
//The bounding box of the image setting field - limits how far left or up an image can be dragged. (image in this case being a reflection of an element on the 'fill' screen)
var imageSetX; var imageSetY;
var contextMenuTarget;

function initializePage(){
	// Get the element with id="defaultOpen" and click on it  
	document.getElementById('defaultOpen').click();
	fields = 1;

	while(document.getElementById('images').firstChild){
		//I have to do this bullshit because apparently divs are pre-initialized with text and I can't iterate through fields otherwise.
		document.getElementById('images').removeChild(document.getElementById('images').firstChild);
	}
	while(document.getElementById('componentList').firstChild){
		//I have to do this bullshit because apparently divs are pre-initialized with text and I can't iterate through fields otherwise.
		document.getElementById('componentList').removeChild(document.getElementById('componentList').firstChild);
	}
	document.addEventListener("contextmenu", (e) => {e.preventDefault();});
	document.getElementById("imgLinkUpload").addEventListener('click', (e) => {
		e.preventDefault();
		console.log(document.getElementById("imgLink").value);
		createImgFromSource(document.getElementById("imgLink").value);
	})
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
	var varList = document.getElementById("componentList");
	var count = 0;
	//alert(count);
	//alert("value saved! Current count: " + varList.getAttribute('value'));
	//Find a free id
	while(document.getElementById('var' + count) != null){count++;}
	
	let element = document.createElement('input');
	element.type = "text";
	element.id= 'var'+(count);
	element.size=10;
	//alert("child created.");
	
	//alert("Child textbox added, id: " +(element.getAttribute('id')));
	
	//linebreak = document.createElement("br");
	element.setAttribute('posX', 0);
	element.setAttribute('posY', 0);
	element.style.position = 'absolute';
	varList.append(element);
	addImage(element.id);
	//alert(newDiv.posX);

}


//This all needs to be reworked!!
function findAndReplaceAll(templateText){
	let varList = document.getElementById('componentList');
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

function addImage(sourceVarId){
	let sourceVar = document.getElementById(sourceVarId);
	let newImage = sourceVar.cloneNode(false);
	//newImage.setAttribute('referenceId', sourceDiv.id);
	//newImage.setAttribute('id', sourceDiv.id + 'Image');
	newImage.setAttribute('posX', sourceVar.getAttribute('posX'));
	newImage.setAttribute('posY', sourceVar.getAttribute('posY'));
	newImage.setAttribute('referenceId', sourceVar.getAttribute('id'));
	newImage.setAttribute('id', sourceVar.id+'Image');
	
	newImage.className = 'image';
	newImage.style.position = 'absolute';

	newImage.value = sourceVar.id.substring(3);
	newImage.style.color = 'rgba(0,0,0,0)';

	
	//alert("Type: "+newImage.firstChild.nodeName + " Id: " + newImage.firstChild.id);
	document.getElementById('images').appendChild(newImage);
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
	
	elem.addEventListener("mousedown", (e) => {e.preventDefault()});

	elem.addEventListener("mousedown", (e) => {
		draggedElement = elem.id;
		if(trackedElement != elem.id){
			stopTracking();
			openStyleMenu();
		}
		trackedElement = elem.id;
		document.getElementById(trackedElement).style.outline = '2px solid #ff0000';
		onmousemove = dragElement;
		onmouseup = stopDrag;
		setOffsets(e);
		updateStyleMenu();
		setManualStyleUpdateEvents();
		document.getElementById('componentControls').addEventListener('click', updateStyleMenu);
		document.addEventListener("mousedown", checkClick);
	})
	elem.addEventListener("contextmenu", customContextMenu);
}

function setOffsets(e){
	var imageBoundingBox = document.getElementById('images').getBoundingClientRect();
	var draggableBoundingBox = document.getElementById(draggedElement).getBoundingClientRect();
	console.log('imageBoxX: ' + imageBoundingBox.x + ' imageBoxY: ' + imageBoundingBox.y);
	mouseDragOffsetX = e.clientX - draggableBoundingBox.x;
	mouseDragOffsetY = e.clientY - draggableBoundingBox.y;
	imageSetX = imageBoundingBox.x;
	imageSetY = imageBoundingBox.y;
	console.log('MDOX: ' + mouseDragOffsetX + ' MDOY: ' + mouseDragOffsetY);
}

//Checks whether the box is within the space for var and visual images. I have no idea why this was picked as the name for such a check
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
	document.getElementById(draggedElement).style.left = imageRelativeX(adjustCursorOffsetX(e.clientX - mouseDragOffsetX))+ 'px';
	document.getElementById(draggedElement).style.top = imageRelativeY(adjustCursorOffsetY(e.clientY - mouseDragOffsetY)) + 'px';
	updateStyleMenu();
	//style.top = e.clientY +'px';
}

function stopDrag(e){
	let draggable = document.getElementById(draggedElement);
	console.log(draggable.id);
	console.log(draggable.getAttribute('referenceId'));
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

function createImgOrigin(){
	let source = window.URL.createObjectURL(document.getElementById('image_source').files[0]);
	createImgFromSource(source);
}

function createImgFromSource(source){
	var imgList = document.getElementById("componentList");
	var count = 0;

	//Find a free id
	while(document.getElementById('img' + count) != null){count++;}
	
	var img = document.createElement('img');
	img.src = source;
	img.id= 'img'+(count);
	img.width = 200;
	img.style.position = 'absolute';

	img.setAttribute('posX', 0);
	img.setAttribute('posY', 0);
	imgList.append(img);
	addImage(img.id);
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
			document.getElementById(contextMenuTarget.getAttribute('referenceId')).size = inputLength;
		});
		contextMenu.appendChild(elem);
	}
	if(e.target.nodeName.toLowerCase() == "input"){
		//width changed for default text input fields
		let elem = document.createElement("button");
		elem.innerText = "Rename referenced variable";
		elem.addEventListener('click', (e)=>{
			// 			The 'getElementById().id' is necessary. Otherwise the page has no idea what the return type is (and we ensure the object actually exists).
			let newVarName = prompt("New variable name: ", document.getElementById(contextMenuTarget.getAttribute('referenceId')).id.substring(3)/*'var'.length()*/);
			if(newVarName!=null){
				rebind(contextMenuTarget.id, newVarName);
			}
			contextMenu.style.visibility = "hidden";
			destroyAllContextMenuOptions();
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
	let elemDel = document.createElement("button");
	elemDel.innerText = "Delete";
	elemDel.addEventListener('click', (e) => {
		if(!e.shiftKey && !confirm("Are you sure?")){
			return;
		}
		else{
			stopTracking();
			document.getElementById(contextMenuTarget.getAttribute('referenceId')).remove();
			contextMenuTarget.remove();
			contextMenu.style.visibility = "hidden";
			destroyAllContextMenuOptions();
		}
	})
	elemDel.style.color = '#aa0000';
	contextMenu.appendChild(elemDel);

	//Remove context menu on clicking away
	document.addEventListener("mousedown", (e) => {
		if(contextMenu.getBoundingClientRect().x > e.clientX || contextMenu.getBoundingClientRect().x + contextMenu.getBoundingClientRect().width < e.clientX)
		{contextMenu.style.visibility = 'hidden'; destroyAllContextMenuOptions();} //x within box check
		else if(contextMenu.getBoundingClientRect().y > e.clientY || contextMenu.getBoundingClientRect().y + contextMenu.getBoundingClientRect().height < e.clientY)
		{contextMenu.style.visibility = 'hidden'; destroyAllContextMenuOptions();} //y within box check
	});
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
	if(newTag == ""){
		alert("The variable name cannot be empty!");
		return;
	}
	if(document.getElementById('var'+newTag)){
		alert("An input field with this tag already exists!");
		return;
	}
	else{
		document.getElementById(document.getElementById(inputId).getAttribute('referenceId')).id = 'var'+newTag;
		document.getElementById(inputId).setAttribute('referenceId', 'var'+newTag);
		document.getElementById(inputId).value = newTag;
		document.getElementById(inputId).id = 'var'+newTag+'Image'
	}
}

function openStyleMenu(){
	addAttrTracker('left', 'px');
	addAttrTracker('top', 'px');
}

function setManualStyleUpdateEvents(){
	document.getElementById('leftTracker').addEventListener('input', (e) => {
		document.getElementById(trackedElement).style.left = ((document.getElementById('leftTracker').value > imageSetX) ? document.getElementById('leftTracker').value : imageSetX) + 'px';
	});
	document.getElementById('topTracker').addEventListener('input', (e) => {
		document.getElementById(trackedElement).style.top = ((document.getElementById('topTracker').value > imageSetY) ? document.getElementById('topTracker').value : imageSetY) + 'px';
	});
}

//Since the element style fields are mostly for universal attributes, these can be hardcoded instead of having to play around with evals
function updateStyleMenu(){
	//Record the x/y of the element within the page and cut off the 'px' at the end.
	let leftval = document.getElementById(trackedElement).style.left.substring(0, document.getElementById(trackedElement).style.left.length-2);
	leftval = leftval ? leftval : imageSetX + '';
	document.getElementById('leftTracker').value = leftval;
	document.getElementById('leftTracker').size = leftval.length+1;	//Not necessary, but it looks a little better without the massive empty space at the end of the input field.
	let topVal = document.getElementById(trackedElement).style.top.substring(0, document.getElementById(trackedElement).style.top.length-2);
	topVal = topVal ? topVal : imageSetY + '';
	document.getElementById('topTracker').value = topVal;
	document.getElementById('topTracker').size = topVal.length+1;
}

function addAttrTracker(value, unit = ''){
	let attributes = document.getElementById('componentControls');
	let wrapper = document.createElement('div');
	let elem = document.createElement('input');
	elem.id = value + 'Tracker';
	let label = document.createElement('label');
	label.setAttribute('for', elem.id);
	label.innerText = formatAttrLabel(value);	
	attributes.appendChild(wrapper);
	wrapper.appendChild(label);
	wrapper.appendChild(elem);
	if(unit){
		let unitLabel = document.createElement('label');
		unitLabel.setAttribute('for', elem.id);
		unitLabel.innerText = ' ' + unit;	
		wrapper.appendChild(unitLabel);
	}
}

function formatAttrLabel(label){
	return label[0].toUpperCase() + label.substring(1) + ': ';
}

function closeStyleMenu(){
	let controls = document.getElementById('componentControls');
	while(controls.firstChild){
		controls.firstChild.remove();
	}
}

function checkClick(e){
	let elementBoundingBox = document.getElementById(trackedElement).getBoundingClientRect();
	let styleBoundingBox = document.getElementById('componentControls').getBoundingClientRect();
	if(	(elementBoundingBox.x > e.clientX || elementBoundingBox.x + elementBoundingBox.width < e.clientX) && 
		(styleBoundingBox.x > e.clientX || styleBoundingBox.x + styleBoundingBox.width < e.clientX))
	{stopTracking();} //x within box check (both selected element and css-field)
	else if((elementBoundingBox.y > e.clientY || elementBoundingBox.y + elementBoundingBox.height < e.clientY) && 
			(styleBoundingBox.y > e.clientY || styleBoundingBox.y + styleBoundingBox.height < e.clientY))
	{stopTracking();} //y within box check (both selected element and css-field)
}

function stopTracking(){
	if(!trackedElement){return;}
	document.getElementById('componentControls').removeEventListener('click', updateStyleMenu());
	document.getElementById(trackedElement).style.outline = 0; 
	trackedElement = ""; 
	closeStyleMenu(); 
	document.removeEventListener("mousedown", checkClick);
}