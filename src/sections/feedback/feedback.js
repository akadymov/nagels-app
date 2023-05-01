import React from 'react';

import './feedback.css'

//MUI components

//Local components
import FormContainer from '../../components/form-container';
import { getText } from '../../components/user-text';
import NagelsModal from '../../components/nagels-modal';

//Local services
import NagelsApi from '../../services/nagels-api-service';
import Cookies from 'universal-cookie';


export default class Feedback extends React.Component{

    Cookies = new Cookies();

    constructor(props){
        super(props);
        this.handleSenderNameChange = this.handleSenderNameChange.bind(this);
        this.handleSenderEmailChange = this.handleSenderEmailChange.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.state = {
            title: getText('feedback_lower'),
            senderName: '',
            senderEmail: '',
            message: null,
            feedbackSent: false,
            formMessage: null,
            errors: {},
            modalOpen: false,
            imgFile: null,
            imgFileNameLine: null,
            modalControls: [
                {
                    id: "select_feedback_img_input",
                    type: "input-file",
                    accept: "image/png",
                    onChange: this.handleFileChange
                }
            ],
            textFieldsList: [
                {
                    id:"sender_name", 
                    label:getText('name'), 
                    variant:"outlined", 
                    type: "text", 
                    text: this.Cookies.get('username'),
                    autoComplete: 'on',
                    width: "70vw",
                    onChange: this.handleSenderNameChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                },
                {
                    id:"sender_email", 
                    label:"email", 
                    variant:"outlined", 
                    type: "text", 
                    autoComplete: 'on',
                    width: "70vw",
                    onChange: this.handleSenderEmailChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                },
                {
                    id:"message", 
                    label: getText('message_symbols'), 
                    variant:"outlined", 
                    type: "text", 
                    required: true,
                    autoComplete: 'on',
                    width: "70vw",
                    rows: 5,
                    onChange: this.handleMessageChange, 
                    errorMessage: "", 
                    onClick: this.clearErrorMessage
                }
            ],
            submitButtonList: [
                /*{
                    id:"upload_button", 
                    type:"outlined", 
                    text: getText('upload'), 
                    width: "220px",
                    onSubmit: () => {this.setState({modalOpen: true})}
                },*/
                {
                    id:"submit_button", 
                    type:"contained", 
                    text: getText('submit'), 
                    width: "220px",
                    disabled: true,
                    onSubmit: this.sendFeedback
                },
                {
                    id:"more_feedback", 
                    type:"contained", 
                    text: getText('another_message'), 
                    width: "220px",
                    disabled: false,
                    hidden: true,
                    onSubmit: () => window.location.reload()
                }
            ]
        }
    }

    NagelsApi = new NagelsApi();
    Cookies = new Cookies();



    CheckIfAlreadyLoggedIn = () => {
        const username = this.Cookies.get('username')
        if(username) {
            this.NagelsApi.getUser(username)
            .then((body)=>{
                if(!body.errors){
                    var newTextFieldsList = this.state.textFieldsList
                    var senderNameIndex = newTextFieldsList.findIndex(field => field.id === 'sender_name')
                    if (senderNameIndex >= 0){
                        newTextFieldsList[senderNameIndex].text = username
                    }
                    var senderEmailIndex = newTextFieldsList.findIndex(field => field.id === 'sender_email')
                    if (senderEmailIndex >= 0){
                        newTextFieldsList[senderEmailIndex].text = body.email
                    }
                    this.setState({
                        senderName: username,
                        senderEmail: body.email,
                        textFieldsList: newTextFieldsList
                    })
                }
            })
        }
    }

    sendFeedback = () => {
        this.NagelsApi.sendFeedback(this.state.senderName, this.state.senderEmail, this.state.message, this.state.imgFile)
        .then((body)=>{
            var newSubmitButtonList = []
            var newTextFieldsList = []
            if(body.errors){
                newTextFieldsList = this.state.textFieldsList
                newSubmitButtonList = this.state.submitButtonList
                body.errors.forEach(error=>{
                    switch(error.field) {
                        case 'message':
                            var messageFieldIndex = newTextFieldsList.findIndex(field => field.id === 'message')
                            if(messageFieldIndex >= 0) {
                                newTextFieldsList[messageFieldIndex].errorMessage=error.message
                            }
                        break
                        default:
                            console.log('Unhandled error field in feedback method response!')
                    }
                    var submitButtonIndex = newSubmitButtonList.findIndex(button => button.id === 'submit_button')
                    if(submitButtonIndex >=0){
                        newSubmitButtonList[submitButtonIndex].disabled = true
                    }
                    
                })
                this.setState({
                    textFieldsList: newTextFieldsList,
                    submitButtonList: newSubmitButtonList
                })
            } else {
                newSubmitButtonList = this.state.submitButtonList
                //hide submit button
                var submitButtonIndex = newSubmitButtonList.findIndex(button => button.id === 'submit_button')
                if(submitButtonIndex >= 0){
                    newSubmitButtonList[submitButtonIndex].hidden = true
                }
                //hide upload button
                var uploadImgButtonIndex = newSubmitButtonList.findIndex(button => button.id === 'upload_button')
                if(uploadImgButtonIndex >= 0){
                    newSubmitButtonList[uploadImgButtonIndex].hidden = true
                }
                //display more feedback button
                var moreFeedbackButtonIndex = newSubmitButtonList.findIndex(button => button.id === 'more_feedback')
                if(moreFeedbackButtonIndex >= 0){
                    newSubmitButtonList[moreFeedbackButtonIndex].hidden = false
                }
                // hide input fields
                newTextFieldsList = this.state.textFieldsList
                newTextFieldsList.forEach(field=>{
                    field.hidden = true
                })
                this.setState({
                    submitButtonList: newSubmitButtonList,
                    senderName: null,
                    senderEmail: null,
                    message: null,
                    feedbackSent: true,
                    formMessage: getText('thank_you_for_the_feedback')
                })
            }
        })
    }

    handleSenderNameChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var senderNameFieldIndex = newTextFieldsList.findIndex(field => field.id === 'sender_name')
        if(senderNameFieldIndex >=0){
            newTextFieldsList[senderNameFieldIndex].errorMessage = ''
        }
        this.setState({ 
            senderName: e.target.value,
            textFieldsList: newTextFieldsList,
            feedbackSent: false
        })
    }

    handleSenderEmailChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var senderEmailFieldIndex = newTextFieldsList.findIndex(field => field.id === 'sender_email')
        if(senderEmailFieldIndex >=0){
            newTextFieldsList[senderEmailFieldIndex].errorMessage = ''
        }
        this.setState({ 
            senderEmail: e.target.value,
            textFieldsList: newTextFieldsList,
            feedbackSent: false
        })
    }

    handleMessageChange = (e) => {
        var newTextFieldsList = this.state.textFieldsList
        var newSubmitButtonList = this.state.submitButtonList
        newTextFieldsList.forEach(field=>{
            if(field.id === 'message'){
                field.errorMessage = e.target.value.length > 500 ? getText('too_long_message') + e.target.value.length + '/500)' : ''
                field.label = getText('message_symb') + e.target.value.length + '/500)'
            } else {
                field.errorMessage = ''
            }
        })
        var submitButtonIndex = newSubmitButtonList.findIndex(button => button.id === 'submit_button')
        if(submitButtonIndex >=0){
            newSubmitButtonList[submitButtonIndex].disabled = false
        }
        this.setState({ 
            message: e.target.value,
            textFieldsList: newTextFieldsList,
            feedbackSent: false
        })
    };

    clearErrorMessage = () => {
        var newTextFieldsList = this.state.textFieldsList
        newTextFieldsList.forEach(field => {
            field.errorMessage = ""
        })
        this.setState({ textFieldsList: newTextFieldsList })
    }
    
    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          this.sendFeedback();
        }
    };

    handleFileChange = (e) => {
        var newModalControls = this.state.modalControls
        if (!e.target.files[0]) {
            newModalControls = [
                {
                    id: "select_feedback_img_input",
                    type: "input-file",
                    accept: "image/png",
                    onChange: this.handleFileChange,
                }
            ];
        } else {
            if (e.target.files[0].type !== 'image/png'){
                newModalControls = [
                    {
                        id: "select_feedback_img_input",
                        type: "input-file",
                        accept: "image/png",
                        onChange: this.handleFileChange,
                    },
                    {
                        id: "file_type_error",
                        type: "text",
                        style: 'error',
                        text: getText('only_png_supported')
                    }
                ]
            } else {
                if (e.target.files[0].size > 200000){
                    newModalControls = [
                        {
                            id: "select_feedback_img_input",
                            type: "input-file",
                            accept: "image/png",
                            onChange: this.handleFileChange,
                        },
                        {
                            id: "file_size_error",
                            type: "text",
                            style: 'error',
                            text: getText('max_avatar_size')
                        }
                    ]
                } else {
                    newModalControls = [
                        {
                            id: "select_feedback_img_input",
                            type: "input-file",
                            accept: "image/png",
                            onChange: this.handleFileChange,
                        },
                        {
                            id: "done_upload_feedback_img",
                            type: "button",
                            variant: "contained",
                            text: getText('save'),
                            size: "small",
                            width: '140px',
                            onSubmit: ()=>this.setState({modalOpen: false})
                        }
                    ]
                }
            }
        }
        
        this.setState({ 
            imgFile: e.target.files[0],
            imgFileNameLine: e.target.files[0] ? e.target.files[0].name + '.' + e.target.files[0].type + ' (' + e.target.files[0].size + ')' : null,
            modalControls: newModalControls
         });
    }

    uploadFile = async () => {
        this.NagelsApi.uploadProfilePic(this.Cookies.get('idToken'), this.props.match.params.username || this.Cookies.get('username'), this.state.avatarFile)
        .then((body) => {
            if(body.errors) {
                console.log(body.errors)
            } else {
                window.location.reload()
            }
        })
    }

    componentDidMount = () => {
        this.CheckIfAlreadyLoggedIn()
    }


    render() {
        return(
            <div style={{height: '50vh', textAlign: 'center'}}>
                <FormContainer 
                    isMobile = {this.props.isMobile}
                    isDesktop = {this.props.isDesktop}
                    isPortrait = {this.props.isPortrait}
                    title={this.state.title}
                    onKeyPress={this.handleKeyPress}
                    textFieldsList={this.state.textFieldsList}
                    submitButtonList={this.state.submitButtonList}
                    onSubmit={this.SendLoginRequest}
                    formMessage={this.state.formMessage}
                >
                </FormContainer>
                <NagelsModal
                    open={this.state.modalOpen}
                    text={getText('upload_feedback_img')}
                    isMobile={this.props.isMobile}
                    isDesktop={this.props.isDesktop}
                    isPortrait={this.props.isPortrait}
                    controls={this.state.modalControls}
                    modalCanClose={true}
                    closeModal={()=>this.setState({modalOpen: false})}
                ></NagelsModal>
            </div>
        )
    }
}