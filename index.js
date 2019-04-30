/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const HAPPY_HOUR = [
  {
    dish: "Wine",
    description: "Half pour glass of wine for $4.00, full pour glass for $6.00.",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/wine.mp4"
  },
  {
    dish: "Beers",
    description: "Beers on tap for half off.",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/beer.mp4"
  },
  {
    dish: "Appetizers",
    description: "All appetizer menu items for $5.00",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/fries.mp4"
  },
  {
    dish: "Desserts",
    description: "All dessert menu items for $5.00",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/cake.mp4"
  }
];
const SPECIALS = [
  {
    dish: "Filet Mignon",
    description: "Our signature filet mignon steak, served with mashed potatoes and asparagus.",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/steak.mp4"
  },
  {
    dish: "Pasta Burrata",
    description: "Fresh pasta with vine-ripened tomatoes, garlic, basil, and mozzarella.",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/pasta.mp4"
  },
  {
    dish: "Vegetarian Paella",
    description: "Valencian rice dish with artichoke hearts, green beans, peas and saffron.",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/paella.mp4"
  },
  {
    dish: "Lobster Tails",
    description: "Rich meaty lobster tails with a peanut garlic sauce and butter.",
    vid: "https://s3.amazonaws.com/apl-community-code/restaurant/lobster.mp4"
  }
];

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    let speechText = "Welcome to the Alexa Cafe! "
        + "To get started, you can ask for things like restaurant hours, specials, or happy hour. ";
    let reprompt = "What would you like to learn about? "

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./launchrequest.json')
          });
    }
    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .reprompt(reprompt)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const HappyHourIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HappyHourIntent';
  },
  handle(handlerInput) {
    let speechText = "Here's what we have on happy hour today: "
        + "Wine, Beer, Appetizers, and Desserts. ";
    let reprompt = "What else would you like to learn about? "

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./hh.json'),
            datasources: {
              "restaurantData": {
                "properties": {
                  "title": "HAPPY HOUR",
                  "items": HAPPY_HOUR
                }
              }
            }
          });
    }
    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .reprompt(reprompt)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const SpecialsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'SpecialsIntent';
  },
  handle(handlerInput) {
    let speechText = "Here's what we have as our specials today: "
        + "Filet Mignon, Pasta Burrata, Paella, and Lobster Tails. ";
    let reprompt = "What else would you like to learn about? "

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./hh.json'),
            datasources: {
              "restaurantData": {
                "properties": {
                  "title": "SPECIALS",
                  "items": SPECIALS
                }
              }
            }
          });
    }
    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .reprompt(reprompt)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const ItemIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ItemIntent')
      || (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
          && handlerInput.requestEnvelope.request.arguments.length > 0);
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    let speechText = "Here's more information about : "
    let reprompt = "What else would you like to learn about? "

    //default
    let selectedFood = "Filet Mignon";
    let item = SPECIALS[0];

    if (request.type  === 'Alexa.Presentation.APL.UserEvent') {
      selectedFood = request.arguments[0];
    } else {
      selectedFood = handlerInput.requestEnvelope.request.intent.slots.item.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    }


    let index = 0;
    //check if happy hour item
    while (index < 4) {
      if (selectedFood == HAPPY_HOUR[index].dish) {
        item = HAPPY_HOUR[index];
        break;
      }
      index++;
    }

    index = 0;
    //check if special item
    while (index < 4) {
      if (selectedFood == SPECIALS[index].dish) {
        item = SPECIALS[index];
        break;
      }
      index++;
    }

    speechText += item.dish + ". " + item.description + ". ";

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: "VideoPlayerToken",
            document: require('./item.json'),
            datasources: {
              "restaurantData": {
                "properties": {
                  "item": item
                }
              }
            }
          });
    }
    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .reprompt(reprompt)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    let speechText = "Here's more information about the Alexa Cafe : "
        + "We are open everyday from 3 to 9PM. We are located in downtown Seattle. "
        + "Our phone number is 555 123 4567. Please call ahead for parties greater than 6. ";
    let reprompt = "What else would you like to learn about? "

    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./launchrequest.json')
          });
    }
    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .reprompt(reprompt)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'To get started, you can ask for things like restaurant hours, specials, or happy hour. ';
    
    if (supportsAPL(handlerInput)) {
      handlerInput.responseBuilder
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./launchrequest.json')
          });
    }
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye! Stay Hungry!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('The Alexa Cafe', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

//----------------------------------------------------------------------
//-----------------------------APL HELPER-------------------------------
//----------------------------------------------------------------------

function supportsAPL(handlerInput) {
    const supportedInterfaces =
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HappyHourIntentHandler,
    SpecialsIntentHandler,
    ItemIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

