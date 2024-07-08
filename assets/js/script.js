// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return Date.now();
}

//Helper method to determine background color based on the due date of the project.
function determineBackgroundColor(dueDate, status) {
    const daysLeft = dayjs(dueDate).diff(dayjs().format("MM/DD/YYYY"));
    console.log("Days left for the project to be due: ");
    console.log(daysLeft);
    let cardColorClass;
    if (status === "done") {
        cardColorClass = "bg-light";
    } else if (daysLeft < 0) {
        cardColorClass = "bg-danger"
    } else if (daysLeft == 0) {
        cardColorClass = "bg-warning";
    } else {
        cardColorClass = "bg-light";
    }

    console.log("Returning bg color as: " + cardColorClass)
    return cardColorClass;
}

// Todo create a function to create a task card
function createTaskCard(task) {
    const containerDivEl = $("<div>");
    
    const classesToAdd = "task-card card draggable " + determineBackgroundColor(task.dueDate, task.status);
    containerDivEl.addClass(classesToAdd);
    containerDivEl.css({
        'margin-bottom': "15px",
        'width': '18rem',
        'color': "darkgray"
    });
    containerDivEl.attr("data-task-id", task.id);

    const bodyDivEl = $("<div>");
    bodyDivEl.addClass("card-body");
    const cardTitleEl = $("<h4>");
    cardTitleEl.addClass("card-title")
    cardTitleEl.text(task.title);
    cardTitleEl.css({
        "border-bottom": "1px solid black",
        "padding-bottom": "10px"
    });
    const cardContentEl = $("<p>");
    cardContentEl.addClass("card-text");
    cardContentEl.text(task.description);
    const dateContentEl = $("<p>");
    dateContentEl.addClass("card-text");
    dateContentEl.text(task.dueDate);
    const buttonEl = $("<button>");
    buttonEl.addClass("btn btn-danger");
    buttonEl.attr("data-task-id", task.id);
    buttonEl.css({
        border: "1px solid white"
    })
    buttonEl.text("Delete");

    console.log("Appending child elements to body");
    bodyDivEl.append(cardTitleEl, cardContentEl, dateContentEl, buttonEl);
    containerDivEl.append(bodyDivEl);
    return containerDivEl;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = retrieveFromLocalStorage();
    console.log("Tasks retrieved");
    console.log(tasks);

    if (tasks) {
        //Clear all swim lanes first.
        $("#todo-cards").html("");
        $("#in-progress-cards").html("");
        $("#done-cards").html("");
        console.log("Mapping tasks cards");
        for (t of tasks) {
            // Create card
            const cardDiv = createTaskCard(t);

            // Attach it to the current swim lanes based on status
            if (t.status === "to-do") {
                console.log("mapping it to the to-do swim lane");
                $("#todo-cards").append(cardDiv);
            } else if (t.status === "in-progress") {
                console.log("mapping it to the in-progress swim lane");
                $('#in-progress-cards').append(cardDiv);
            } else {
                console.log("mapping it to the done swim lane");
                $('#done-cards').append(cardDiv);
            }
        }
    }
    // $('.draggable').draggable();

    /*
        axis: controls in which direction can the draggable element move skipped)
        stack: controls the z-index of thedragabble card or else it moves under 
               other elements on the page. This workes only if helper !== clone (skipped)
        containement: the boundary witihin which the draggable element can moveBy.
        cursor: change the mouse cursor to a different style when dragging the element.
        revert: will revert the position of the card back to its original position. (skipped)
        zIndex - applies to the helper element
        helper - creates a clone of the element being dragged.
    */
    // do this here instead of in createTaskCard() when you are dynamically creating the card because
    // at that time the card is not part of the dom as it has not been appended to the swim lane. So the 
    // selector will not find the element hence it cannot attach the ui-* class to it.
    $('.draggable').draggable()
        .draggable("option", "containment", ".swim-lanes")
        .draggable("option", "opacity", 0.8)
        .draggable("option", "cursor", "crosshair")
        .draggable("option", "zIndex", "100")

        .draggable("option", "helper", function (e) {
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            let cloneEl = original.clone();
            cloneEl.css({
                width: original.outerWidth(),
            });
            cloneEl.addClass("draggable");
            // return original.clone().css({
            //     width: original.outerWidth(),
            // });
            return cloneEl;
        });
}

// Heloer function to retrieve from localstore and parse it as a json
function retrieveFromLocalStorage() {
    console.log("Retreiving from localstorage");
    return JSON.parse(localStorage.getItem("tasks"));
}

// Helper method to store to lcoal storage.
function storeToLocalStorage(tasks) {
    console.log("Storing " + JSON.stringify(tasks) + " to localstorage");
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    console.log("Add task event triggered from modal");

    // Fetch the elements on the modal
    const titleEl = $("#title");
    const taskDateEl = $("#tDate");
    const taskDescriptionEl = $("#tDescription");

    console.log(`User entered title: ${titleEl.val()} and date: ${taskDateEl.val()}`);
    if (titleEl.val() === "" || taskDateEl.val() === "" || taskDescriptionEl.val() === "") {
        console.log("One or more fields are missing");
        $('#errorMsgRow').attr("class", "row d-block");
        $('#errorMsg').attr("class", "text-danger");
        $('#errorMsg').text("Enter all the fields!");
        return
    }
    const taskInfo = {
        id: generateTaskId(),
        title: titleEl.val(),
        dueDate: taskDateEl.val(),
        status: "to-do",
        description: taskDescriptionEl.val()
    }
    console.log("All fields entered, preparing data to store in local storage");
    let tasks = retrieveFromLocalStorage();
    if (tasks) {
        tasks.push(taskInfo);
    } else {
        tasks = [task];
    }
    storeToLocalStorage(tasks);

    //clear fields
    console.log("clearing the text fields");
    titleEl.val("");
    taskDateEl.val("");
    taskDescriptionEl.val("");

    console.log("render tasks to the ui");
    $('#formModal').modal('hide')
    renderTaskList();
}

// create a function to handle deleting a task
function handleDeleteTask(event) {
    const delBtnEl = event.target;
    console.log(delBtnEl);
    let taskId = delBtnEl.getAttribute("data-task-id");
    taskId = Number(taskId);
    console.log(`Deleting task with id: ${taskId}`);
    let tasks = retrieveFromLocalStorage();
    let idx;
    for (let i = 0; i < tasks.length; i++) {
        if (taskId === tasks[i].id) {

            idx = i;
            console.log(`Found task to delete @ ${idx}`);
            break;
        }
    }

    console.log(`Deleting task at idx: ${idx}`);
    tasks.splice(idx, 1);

    console.log("Updating local storage with the new task list");
    storeToLocalStorage(tasks)

    console.log("render the updated tasks list to ui");
    renderTaskList();
}

// create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    console.log("event");
    console.log(event);
    console.log("ui");
    console.log(ui);

    console.log("Gather the swim lane id where the element was moved to");
    //This will return to-do/in-progress/done. Make sure to attach the droppable to the correct
    //div element.
    const swimLaneId = event.target.id;

    console.log("Gathering the task id of the task that was moved");
    const taskId = ui.draggable[0].dataset.taskId;

    const tasks = retrieveFromLocalStorage();
    for (t of tasks) {
        if (t.id == taskId) {
            console.log(`Updating the status of task: ${t.id} to: ${swimLaneId}`)
            t.status = swimLaneId
        }
    }

    console.log("Update locastorage with the latest copy of the data");
    storeToLocalStorage(tasks);

    console.log("Re-rendering...");
    renderTaskList();
}

// <----- Event handlers ----->

// Add event listener - show.bs.modal which will be triggered just before the modal is shown, 
// to hide the error msg row.
$('#formModal').on("show.bs.modal", function () {
    $('#errorMsgRow').attr("class", "row d-none");
});

//Add event listener for click event on a card, which will be actionable only if the click
//is done on the button.
$(".card").on("click", ".btn-danger", handleDeleteTask);

// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

    // Render task if it exists in local storage
    renderTaskList();

    // Making the date field in the modal a date picker 
    $('#tDate').datepicker({
        changeMonth: true,
        changeYear: true
    });

    // Attaching Add task event handler to the button on the modal 
    $("#addTask").on('click', handleAddTask);

    // Add event listener to the input fields in the modal to hide the error message 
    // when user clicks them
    $('#tDate').add("#title").add("#tDescription").on('click', function () {
        $('#errorMsgRow').attr("class", "row d-none");
    })

    // Make the swim lanes droppable
    /*
        accept: droppable will accept only elements that have the .draggable class
        drop: callback function when an element is droped 
    */
    $(".lane").droppable({
        accept: '.draggable',
        drop: handleDrop
    });

});
