import React from 'react';

import './onboarding-container.css';

import FormButton from '../form-button';
import { getText } from '../user-text';
import Cookies from 'universal-cookie';

export default class OnboardingContainer extends React.Component{

    Cookies = new Cookies();

    nextOnboarding = () => {
        var currentDate = new Date(); 
        var currentOnboarding = parseInt(this.Cookies.get('onboarding' + this.props.section))
        var expiresInEternal = new Date(currentDate.getTime + 999999999)
        this.Cookies.set('onboarding' + this.props.section, currentOnboarding + 1, { path: '/' , preferredLang: expiresInEternal})
        window.location.reload()
    }

    skipOnboarding = () => {
        var currentDate = new Date(); 
        var currentOnboarding = parseInt(this.Cookies.get('onboarding' + this.props.section))
        var expiresInEternal = new Date(currentDate.getTime + 999999999)
        this.Cookies.set('onboarding' + this.props.section, '-1', { path: '/' , preferredLang: expiresInEternal})
        window.location.reload()
    }

    render () {
        return(
            <div 
                className={`onboarding-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                style={{
                    display: this.props.onboardingStage >= 0 ? 'block' : 'none',
                    backgroundColor: this.props.faded ? 'var(--transparentElementBckgr)' : 'unset'
                }}
            >
                <div 
                    className={`onboarding-tooltip ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                    style={{ 
                        left: this.props.left,
                        right: this.props.right,
                        top: this.props.top,
                        bottom: this.props.bottom,
                        height: this.props.height,
                        width: this.props.width
                     }}
                >
                    <div className={`onboarding-text-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        {this.props.text}
                    </div>
                    <div 
                        className={`onboarding-image-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}
                        style={{ display: this.props.img ? 'block' : 'none' }}
                    >
                        <img 
                            style={{
                                width: this.props.width,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block'
                            }} 
                            src={"/info/images/" + this.props.img}
                        ></img>
                    </div>
                    <div className={`onboarding-controls-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                        <FormButton
                            key="next_onboarding"
                            variant="contained"
                            text={this.props.isLastOnboardingStage ? getText('ok') : getText('next')}
                            width='140px'
                            onSubmit={this.props.isLastOnboardingStage ? this.skipOnboarding : this.nextOnboarding}
                            //disabled={button.disabled}
                            size='small'
                        ></FormButton>
                    </div>
                    {this.props.isLastOnboardingStage ? 
                        ''
                    :
                        <div className={`onboarding-controls-container ${ this.props.isMobile ? "mobile" : (this.props.isDesktop ? "desktop" : "tablet")} ${ this.props.isPortrait ? "portrait" : "landscape"}`}>
                            <FormButton 
                                key="skip_onboarding"
                                text={getText('skip')}
                                width='140px'
                                color='error'
                                onSubmit={this.skipOnboarding}
                                //disabled={button.disabled}
                                size='small'
                            ></FormButton>
                        </div>
                    }
                </div>
            </div>
        )
    }
}