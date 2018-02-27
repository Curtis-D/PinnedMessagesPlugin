//META{"name":"PopoutMessagesPage"}*//
var PopoutMessagesPage;

PopoutMessagesPage = function() {
    var React, ReactDOM, WebpackModules, MessagesPopout, originalRenderPopout, defineComponents, PinnedMessagesPageWrapper, RecentMentionsPageWrapper, popoutCount = 0;

    class PopoutMessagesPage {

        getName() {
            return "PopoutMessagesPage";
        }

        getDescription() {
            return "Changes your Pinned Messages/Recent Mentions popout into a channel sized view and allows you to copy and paste messages from Pinned Messages/Recent Mentions. Huge thanks to square for all his help.";
        }

        getVersion() {
            return "1.0.0";
        }

        getAuthor() {
            return "Green";
        }

        load() {
            ({
                reactDom: ReactDOM,
                react: React,
                WebpackModules
            } = BDV2);

            defineComponents();
        }

        start() {
        
            MessagesPopout = WebpackModules.find(module => module.displayName === "MessagesPopout" && module.prototype.render);
            
            if(bdPluginStorage.get("PopoutMessagesPage", "Pinned Messages") === null)
                bdPluginStorage.set("PopoutMessagesPage", "Pinned Messages", true);
            if(bdPluginStorage.get("PopoutMessagesPage", "Recent Mentions") === null)
                bdPluginStorage.set("PopoutMessagesPage", "Recent Mentions", true);
            
            originalRenderPopout = MessagesPopout.prototype.render;

            MessagesPopout.prototype.render = function() {
                var returnOriginal = originalRenderPopout.call(this);
                    
                try {
                    let messagesWrapper = document.querySelector(".messages-wrapper");
                    let channelName = document.querySelector(".channelName-1G03vu");
                    let [messagesHeader, messagesPopout] = returnOriginal.props.children;
                    switch(this.props.analyticsName) {
                        case "Channel Pins":
                            if(bdPluginStorage.get("PopoutMessagesPage", "Pinned Messages")){
                                return ReactDOM.createPortal(
                                    React.createElement(PinnedMessagesPageWrapper, {
                                        messagesWrapper,
                                        messagesPopout,
                                        channelName,
                                        owner: this
                                    }),
                                    messagesWrapper
                                );
                            }
                        case "Recent Mentions":
                            if(bdPluginStorage.get("PopoutMessagesPage", "Recent Mentions")){
                                return ReactDOM.createPortal(
                                    React.createElement(RecentMentionsPageWrapper, {
                                        messagesWrapper,
                                        messagesHeader,
                                        messagesPopout,
                                        channelName,
                                        owner: this
                                    }),
                                    messagesWrapper
                                );
                            }
                    }
                } catch (err) {
                    console.error(err);
                }

                return returnOriginal;
            };

        }

        stop() {
            originalRenderPopout && (MessagesPopout.prototype.render = originalRenderPopout);
            originalRenderPopout = null;
        }
        
        getSettingsPanel() {
            return `<h3>Popout Messages Page Settings</h3>
                    <br><label style = 'color:white'>
                    <input name='Pinned Messages' type='checkbox' onchange='PopoutMessagesPage.updateSettings(this)'>Pinned Messages</label>
                    <br><label style = 'color:white'>
                    <input name='Recent Mentions' type='checkbox' onchange='PopoutMessagesPage.updateSettings(this)'>Recent Mentions</label>`;
        }
        
        static updateSettings({ name, checked }) {
            bdPluginStorage.set("PopoutMessagesPage", name, checked);
        }


    };

    defineComponents = function() {
                
        PinnedMessagesPageWrapper = class extends React.PureComponent {
            constructor() {
                super(...arguments);
                this.state = {
                    scrollerWrap: this.props.messagesWrapper.querySelector(".scroller-wrap"),
                    channelName: this.props.channelName.lastChild
                };
            }

            componentDidUpdate() {
                this.stylePage();
            }

            componentDidMount() {
                this.state.scrollerWrap.style = "display:none";
                this.state.channelName.textContent =
                    this.state.channelName.textContent.slice(0, this.state.channelName.textContent.length - 18 * popoutCount) + " - Pinned Messages";
                this.removeCloseListeners();
                this.stylePage();
                popoutCount++;
            }

            componentWillUnmount() {
                popoutCount--;
                let channelNameText = this.state.channelName.textContent;
                let textArea = document.querySelector(".textArea-20yzAH");
                if(channelNameText.slice(-18) === " - Pinned Messages")
                    this.state.channelName.textContent = this.state.channelName.textContent.slice(0, -18);
                if( !popoutCount )
                    this.state.scrollerWrap.removeAttribute("style");
                document.querySelector(".chat .messages-wrapper ~ form").style.display = "initial";
            }

            removeCloseListeners() {
                let element = this.props.owner._reactInternalFiber;
                do element = element.return;
                while (element.stateNode.constructor && element.stateNode.constructor.displayName !== "Popout");

                let {
                    close,
                    closeContext
                } = element.stateNode;

                process.nextTick(() => {
                    document.removeEventListener("click", close, true);
                    document.removeEventListener("contextmenu", closeContext, true);
                });
            }

            stylePage() {
                let pinnedMessagesPage = this.props.messagesWrapper.querySelectorAll(".scroller-wrap")[1];
                pinnedMessagesPage.querySelectorAll(".sink-interactions.clickable").forEach((element) => {
                    element.style.display = "none";
                });
                pinnedMessagesPage.querySelectorAll(".message.first").forEach((element) => {
                    element.style.maxWidth = "100%";
                });
                pinnedMessagesPage.querySelectorAll(".body").forEach((element) => {
                    element.style.webkitUserSelect = "text";
                });
                pinnedMessagesPage.querySelectorAll(".action-buttons").forEach((element) => {
                    element.style.boxShadow = "inherit";
                    element.style.backgroundColor = "inherit";
                });       
                pinnedMessagesPage.querySelectorAll(".jump-button").forEach((element) => {
                    element.style.backgroundColor = "inherit";
                }); 
                document.querySelector(".chat .messages-wrapper ~ form").style.display = "none";
            }

            render() {
                return React.cloneElement(this.props.messagesPopout, {
                        key: "pins"
                    }
                );
            }
        };

        RecentMentionsPageWrapper = class extends React.PureComponent {
            constructor() {
                super(...arguments);
                this.state = {
                    scrollerWrap: this.props.messagesWrapper.querySelector(".scroller-wrap"),
                    channelName: this.props.channelName.lastChild
                };
            }

            componentDidUpdate() {
                this.stylePage();
            }

            componentDidMount() {
                this.state.scrollerWrap.style = "display:none";
                this.state.channelName.textContent =
                    this.state.channelName.textContent.slice(0, this.state.channelName.textContent.length - 18 * popoutCount) + " - Recent Mentions";
                this.removeCloseListeners();
                this.stylePage();
                popoutCount++;
            }

            componentWillUnmount() {
                popoutCount--;
                let channelNameText = this.state.channelName.textContent;
                if(channelNameText.slice(-18) === " - Recent Mentions")
                    this.state.channelName.textContent = this.state.channelName.textContent.slice(0, -18);
                if( !popoutCount )
                    this.state.scrollerWrap.removeAttribute("style");
                delete PopoutMessagesPage.prototype.onSwitch;
                document.querySelector(".chat .messages-wrapper ~ form").style.display = "initial";
            }

            removeCloseListeners() {
                let element = this.props.owner._reactInternalFiber;
                do element = element.return;
                while (element.stateNode.constructor && element.stateNode.constructor.displayName !== "Popout");

                let {
                    close,
                    closeContext
                } = element.stateNode;

                process.nextTick(() => {
                    document.removeEventListener("click", close, true);
                    document.removeEventListener("contextmenu", closeContext, true);
                });
                
                PopoutMessagesPage.prototype.onSwitch = function(){
                    close({path: []});
                    delete PopoutMessagesPage.prototype.onSwitch;
                };
            }

            stylePage() {
                let recentMentionsPage = this.props.messagesWrapper.querySelector(".recent-mentions-popout");     
                recentMentionsPage.querySelector(".title").style.display = "none";
                recentMentionsPage.querySelectorAll(".sink-interactions.clickable").forEach((element) => {
                    element.style.display = "none";
                });
                recentMentionsPage.querySelectorAll(".message.first").forEach((element) => {
                    element.style.maxWidth = "100%";
                });
                recentMentionsPage.querySelectorAll(".body").forEach((element) => {
                    element.style.webkitUserSelect = "text";
                });
                recentMentionsPage.querySelectorAll(".action-buttons").forEach((element) => {
                    element.style.boxShadow = "inherit";
                    element.style.backgroundColor = "inherit";
                });       
                recentMentionsPage.querySelectorAll(".jump-button").forEach((element) => {
                    element.style.backgroundColor = "inherit";
                });
                document.querySelector(".chat .messages-wrapper ~ form").style.display = "none";
            }

            render() {
                return React.createElement("div", {className: "scroller-wrap"}, 
                    React.createElement("div", {
                        className: "messages-popout scroller recent-mentions-popout",
                        style: {
                            padding: "1px 13px 7px 13px"
                        },
                        key: "mentions"
                    },
                    this.props.messagesHeader,
                    this.props.messagesPopout.props.children[0]
                    )
                );
            }
        };

    };

    return PopoutMessagesPage;

}();
