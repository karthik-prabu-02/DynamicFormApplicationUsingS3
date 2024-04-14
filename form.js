AWS.config.update({
    accessKeyId: 'AKIAUK63FCOFC6OFRRC4',
    secretAccessKey: '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',
    region: 'us-east-1'
});
var s3 = new AWS.S3();

// function listBucket () {
//     const bucketNames = ['katkat.com', 'katkat-formsubmit'];
//     bucketNames.forEach(bucketName => {
//         const listParams = {
//             Bucket: bucketName
//         };
//         s3.listObjectsV2(listParams, (err, data) => {
//             if (err) {
//                 console.error('Error getting bucket info:', err);
//                 return;
//             }
//             console.log('Bucket information for', bucketName, ':', data);
//         });
//     });
// }

// upload form data to s3
function uploadFormData (formcollectionData) {
    const bucketFormName = 'katkat-formsubmit';
    const epochTime = new Date().getTime();
    const fileName = `${epochTime}.json`;
    console.log(fileName,"filename");
    const params = {
        Bucket: bucketFormName,
        Key: fileName,
        Body: JSON.stringify(formcollectionData),
        ContentType: 'application/json'
    };
    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading data:', err);
            alert('Error uploading data');
        } else {
            console.log('Data uploaded successfully:', data);
            alert('Data uploaded successfully');
            // listBucket();
        }
    });
}




async function renderForm() {
    const countriesUrl = 'https://s3.amazonaws.com/katkat.com/countries.json';
    const formUrl = 'https://s3.amazonaws.com/katkat.com/form.json';
    const fruitsUrl = 'https://s3.amazonaws.com/katkat.com/favoriteFruit.json';
    const colorsUrl = 'https://s3.amazonaws.com/katkat.com/favoriteColor.json';
    const phoneUrl = 'https://s3.amazonaws.com/katkat.com/types.json';
    const [formDataResponse, countriesResponse , fruitsResponse , colorsResponse , phonesResponse] = await Promise.all([
        fetch(formUrl),
        fetch(countriesUrl),
        fetch(fruitsUrl),
        fetch(colorsUrl),
        fetch(phoneUrl),

    ]);

    const formData = await formDataResponse.json();
    const countriesData = await countriesResponse.json();
    const fruitsData = await fruitsResponse.json();
    const colorsData = await colorsResponse.json();
    const phoneData = await phonesResponse.json();

    console.log(formData , "formData");
    console.log(countriesData , "countriesData");
    console.log(fruitsData , "fruitsData");
    console.log(colorsData , "colorsData");
    console.log(phoneData, "phoneData");

    document.title = formData['page title'];
    
    const formContainer = document.getElementById("formContainer");
    formContainer.innerHTML = `
        <h1 class="pageHeading">${formData['page heading'].charAt(0).toUpperCase() + formData['page heading'].slice(1)}</h1>
        ${
            formData.textblocks.map((block) => {
                return `
                    <div class="textblock" style="left: ${block['x-position']}px; top: ${block['y-position']}px;">
                        <p>${block.content}</p>
                    </div>
                `
            }).join('')
        }
        ${
            formData.fields.map((field) => {
                switch (field.type) {
                    case 'TextBox' :
                        return `
                            <div class="field ${field.type}" style=" left: ${field['x-position']}px; top: ${field['y-position']}px;">
                                <label for="${field.heading.replace(/\s/g, '')}">${field.heading}</label>
                                <input id="${field.heading.replace(/\s/g, '')}" type="${field.value === "string" ? "text" : field.value === "number" ? "number" : "text"}"  ${field['max value'] ? `max="${field['max value']}"`:`maxlength="${field['max characters']}"`} name="${field.heading.trim()}" placeholder="${field.tooltip}" title="${field.tooltip}" required>
                                <div id="${field.heading.replace(/\s/g, '')}Validation"></div>
                            </div>
                        `;
                    case "MultilineTextBox" :
                        return `
                            <div class="field ${field.type}" style="margin-top: 30px; left: ${field['x-position']}px; top: ${field['y-position']}px;">
                                <label for="${field.heading}">${field.heading}</label>
                                <textarea id="${field.heading}" name="${field.heading}" maxlength="${field['max characters']}" placeholder="${field.tooltip}" title="${field.tooltip}" required></textarea>
                                <div id="${field.heading.replace(/\s/g, '')}Validation"></div>
                            </div>
                        `;
                    case "Checkbox" :
                        return `
                            <div class="field ${field.type}" style="margin-top: 30px;left: ${field['x-position']}px; top: ${field['y-position']}px;">
                                <label for="${field.type.replace(/\s/g, '')}">${field.heading}</label>
                                <input type="checkbox" id="${field.type.replace(/\s/g, '')}" name="${field.type}" checked="${field.default}" title="${field.tooltip}">
                            </div>
                        `;
                    case "MultiSelectList" :
                    case "DropDownList"  :
                        return `
                            <div id="selectForm" class="field ${field.type}" style="margin-top: 30px;left: ${field['x-position']}px; top: ${field['y-position']}px;">
                                <label for="${field.heading.replace(/\s/g, '')}">${field.heading}</label>
                                <select name="${field.heading.replace(/\s/g, '')}" id="${field.heading.replace(/\s/g, '')}" title="${field.tooltip}" ${field.type === "MultiSelectList" ? "multiple" :""}  ${field.heading === "Country" ? 'onChange="countryFilter()"' : ""} >
                                    ${
                                        field.type === "MultiSelectList" ?
                                            `
                                            <option value="">${fruitsData.key}</option>    
                                            ${
                                                fruitsData.value.map(fruit => {
                                                    return `
                                                        <option value="${fruit}">${fruit}</option>    
                                                        
                                                    `
                                                }).join('')
                                            }
                                            </select>` 
                                        :   field.type ===  "DropDownList" && field.heading === "Country" ?
                                        `
                                            <option value="">${field.key}</option>    
                                            ${
                                                countriesData.map(countries => {
                                                    return `
                                                    <option value="${countries.country}">${countries.country}</option> 
                                                    `
                                                }).join('')
                                            }
                                        `
                                        : field.type === "DropDownList" && field.heading === "State" ?
                                        `  
                                            <option value="">${field.heading}</option>
                                        
                                        `
                                        : ""
                                    }   
                                </select>
                            </div>
                        `;
                    case "RadioButton" :
                        return `
                            <div class="field ${field.type}" style=" padding:20px; display:flex; justify-content: start ; align-items:center">
                                ${
                                    phoneData.map(ph => {
                                        return `
                                        <div>
                                            <label for="${ph.category}" style="margin-right:30px">${ph.category}</label>
                                            <input id="${ph.category}" name="${field.type}" type="radio"  value="${ph.category}" title="${field.tooltip}" onChange="radioChange(this.value)">
                                        </div>
                                        `
                                    }).join('')
                                }
                                <div id="radiobtnDiv" style="margin-left:100px;"></div>
                            </div>
                        `;
                    case "AddRemoveList" : 
                        return `
                        <div class="field ${field.type}">
                            <label for="${field.type}">Favorite Color</label>
                            <div class="list-container">
                                <ul id="colorList">
                                    ${
                                        colorsData.value.map( color => {
                                            return `
                                                <li style="display:flex;flex-direction:row;justify-content:space-between">
                                                    <span>${color}</span>
                                                    <button class="removeColorBtn" onclick="removeColor(this.parentNode)">Remove Color</button>
                                                </li>
                                            `
                                        }).join('')
                                    }
                                </ul>
                                <input type="text" name="${field.type}" id="${field.type}" placeholder="Add a color" title="${field.tooltip}">
                                <button onclick="addColor()">Add Color</button>
                            </div>
                        </div>

                        `
                    default : return "";
                }  
            }).join('')
        }
        ${
            formData.buttons.map((button) => {
                return `
                    <button type="${button.javascript === "js/submit.js" ? "submit" : "reset"}" title="${button.tooltip}" class="button ${button.title}" ${button.javascript === "js/submit.js" ? 'onClick="submitForm()"':'onClick="clearForm()"'}}px;">${button.title}</button>
                `
            }).join('')
        }
    `;
}
renderForm();

// functionality  
async function countryFilter () {
    const value = document.getElementById('Country').value;
    console.log(value,"onChange");

    const stateResponse = await fetch('https://s3.amazonaws.com/katkat.com/countries.json');
    const stateData = await stateResponse.json();

    const selectState = document.getElementById('State');

    const countryFiltered = stateData.filter(countries => countries.country === value);

    selectState.innerHTML = `
        <option value="">${countryFiltered[0].country}</option>
        ${
            countryFiltered[0].states.map(state => {
                return `
                <option value="${state}">${state}</option> 
                `
            }).join('')
        }
    `;
}
async function radioChange(value) {
    const Response = await fetch('https://s3.amazonaws.com/katkat.com/types.json');
    const data = await Response.json();
    // console.log(value,"Vl")
    const filteredRadio = data.filter(types => types.category === value);
    console.log(filteredRadio);
    const radioDiv = document.getElementById('radiobtnDiv');
    radioDiv.innerHTML = `
        ${
            filteredRadio[0].types.map(type => {
                return `
                <div>
                    <label for="${type}">${type}</label>
                    <input id="${type.replace(/\s/g, '')}" name="${type}" type="radio"  value="${type}">
                </div>
                `
            }).join('')
        }
    `;         
}

function addColor() {
    const colorInput = document.getElementById('AddRemoveList');
    const color = colorInput.value.trim();
    if (color !== '') {
        const colorList = document.getElementById('colorList');
        colorList.insertAdjacentHTML('beforeend', `
            <li style="display:flex;flex-direction:row;justify-content:space-between">
                <span>${color}</span>
                <button class="removeColorBtn" onclick="removeColor(this.parentNode)">Remove Color</button>
            </li>
        `);
        colorInput.value = '';
    }
}
function removeColor(li) {
    li.remove();
}
function clearForm () {
    document.getElementById('FirstName').value = "";
    document.getElementById('Address').value = "";
    document.getElementById('PhoneNumber').value = "";
    document.getElementById('Checkbox').checked = true;
    document.getElementById('FavoriteFruits').value = "";
    document.getElementById('Country').value = "";
    document.getElementById('State').value = "";
    document.getElementById('State').innerHTML = `<option value="">States</option>`;
    document.getElementById('phone').checked = "";
    document.getElementById('internet').checked = "";
    document.getElementById('tv').checked = "";
    document.getElementById('radiobtnDiv').innerHTML = "";
    
    
    document.getElementById('AddRemoveList').value = "";
    const colorList = document.getElementById('colorList');
    const listItems = colorList.querySelectorAll('li');
    for (let i = 2; i < listItems.length; i++) {
        colorList.removeChild(listItems[i]);
    }

    document.getElementById('FirstNameValidation').innerHTML=""
    document.getElementById('AddressValidation').innerHTML=""
    document.getElementById('PhoneNumberValidation').innerHTML=""


}
function submitForm () {
    const firstName = document.getElementById('FirstName').value ;
    const address = document.getElementById('Address').value ;
    const phoneNumber = document.getElementById('PhoneNumber').value ;
    const permanent = document.getElementById('Checkbox').checked;
    const countries = document.getElementById('Country').value;
    const states = document.getElementById('State').value;
    
    const fruits = document.getElementById('FavoriteFruits').value;
    const selectedFruits = Array.from(document.getElementById('FavoriteFruits').options)
    .filter(option => option.selected)
    .map(option => option.value);
    
    const colorList = document.getElementById('colorList');
    const spans = colorList.querySelectorAll('li span');
    const colorsArray = Array.from(spans).map(span => span.textContent);
    // console.log(colorsArray,"arr");
    let phone = null;
    document.getElementById("phone").checked === true ? 
        document.getElementById('HomePhone').checked === true ? 
            phone = document.getElementById('HomePhone').value 
        :
        document.getElementById('CellPhone').checked === true ? 
            phone = document.getElementById('CellPhone').value 
        : 
        document.getElementById('SatellitePhone').checked === true ? 
            phone = document.getElementById('SatellitePhone').value 
        : null
    :null;


    let internet = null;
    document.getElementById("internet").checked === true ? 
        document.getElementById('Cable').checked === true ? 
            phone = document.getElementById('Cable').value 
        :
        document.getElementById('Fiber').checked === true ? 
            phone = document.getElementById('Fiber').value 
        : 
        document.getElementById('Satellite').checked === true ? 
            phone = document.getElementById('Satellite').value 
        : null
    :null;

    let tv = null;
    document.getElementById("tv").checked === true ? 
        document.getElementById('CRT').checked === true ? 
            phone = document.getElementById('CRT').value 
        :
        document.getElementById('Plasma').checked === true ? 
            phone = document.getElementById('Plasma').value 
        : 
        document.getElementById('LCD').checked === true ? 
            phone = document.getElementById('LCD').value 
        : document.getElementById('LED').checked === true ? 
            phone = document.getElementById('LED').value 
        : null
    :null;



    firstName || /^[a-zA-Z ]+$/.test(firstName) ? 
        document.getElementById('FirstNameValidation').innerHTML=""
         : null;
        address ? 
        document.getElementById('AddressValidation').innerHTML=""
         : null
        phoneNumber || /^\d{10}$/.test(phoneNumber) ? 
        document.getElementById('PhoneNumberValidation').innerHTML=""
         : 
        null

    if (!firstName || !/^[a-zA-Z ]+$/.test(firstName) || !address ||  !phoneNumber || !/^\d{10}$/.test(phoneNumber) ) {
        if(!firstName || !/^[a-zA-Z ]+$/.test(firstName))  {
            const validate = document.getElementById('FirstNameValidation');
            validate.innerHTML = `
                <p>Please Enter valid Name</p>
            `;
        }
        if (!address ){
            const validate = document.getElementById('AddressValidation');
            validate.innerHTML = `
                <p>Please Enter Address</p>
            `;

        }
        if ( !phoneNumber || !/^\d{10}$/.test(phoneNumber) ) {
            const validate = document.getElementById('PhoneNumberValidation');
            validate.innerHTML = `
                <p>Please Enter Valid Phone Number</p>
            `
            
        }
        return ;
    }
    let formcollectionData = [
        {
            key: "First Name",
            value: firstName
        },
        {
            key: "Address",
            value: address
        },
        {
            key: "Permanent",
            value: permanent
        },
        {
            key: "Phone Number",
            value: phoneNumber
        },
        {
            key: "Favorite Fruits",
            value: selectedFruits
        },
        {
            key: "Country",
            value: countries
        },
        {
            key: "State",
            value: states
        },
        {
            key:  document.getElementById('phone').checked === true ? "Type Of Phone" : document.getElementById('internet').checked === true ? "Type Of Internet" : document.getElementById('tv').checked === true ? "Type Of Tv": null ,
            value: phone !== null ? phone : internet !== null ? internet : tv !== null ? tv : null
        },
        {
            key: "Favorite Color",
            value: colorsArray
        }
    ];
    console.log(formcollectionData , "collection");
    uploadFormData(formcollectionData);

}
