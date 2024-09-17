const { Then } = require('@cucumber/cucumber');
const axios = require('axios');

Then('I create an event with the following details:', async function (dataTable) {
    const data = dataTable.raw();
    
    const Environment = data[1][0]; 
    const Bearer = "a"
    const Title = data[1][2]; 
    const Desc = data[1][3];
    const Agenda = data[1][4];

    let serID;
    if (Environment === "Stage") {
        serID = "6211a2a1-3c5c-4d49-b3a5-58ebd70efed9";
    } else if (Environment === "Dev") {
        serID = "3fd45107-16ee-49cd-aa1f-8dfd87368d38";
    }

    const ENV_URLS = {
        Dev  : 'https://wcms-events-service-layer-deploy-ethos102-stage-va-9c3ecd.stage.cloud.adobe.io',
        Stage: 'https://events-service-layer-stage.adobe.io',
        Prod : 'https://events-service-layer.adobe.io'     
    };

    const ENV_URL = ENV_URLS[Environment];
    if (!ENV_URL) {
        throw new Error("Unknown environment selected.");
    }

    const firstPayload = {
        topics: ["Illustration", "Photography"],
        eventType: "InPerson",
        cloudType: "CreativeCloud",
        seriesId: serID,
        rsvpRequired: true,
        templateId: "a",
        title: Title,
        description: Desc,
        localStartDate: "2024-07-31",
        localEndDate: "2024-07-31",
        localStartTime: "10:00:00",
        localEndTime: "12:45:00",
        localStartTimeMillis: 1722445200000,
        localEndTimeMillis: 1722455100000,
        timezone: "America/Los_Angeles"
    };

    if (Agenda === 'Yes') {
        firstPayload.agenda = [{ startTime: "10:15:00", description: "Agenda1" }];
    }

    try {
        // Send the first request
        const response1 = await axios.post(`${ENV_URL}/v1/events`, firstPayload, {
            headers: { Authorization: `Bearer ${Bearer}` }
        });
        console.log('First request succeeded.');
        const eventId = response1.data.eventId;
        if (!eventId) {
            throw new Error('Failed to extract eventId from response.');
        }

        const secondPayload = {
            venueName: "AdobeCircle",
            address: "AdobeCircle",
            city: "Taylorsville",
            state: "Utah",
            stateCode: "UT",
            postalCode: "84129",
            country: "US",
            placeId: "EiZBZG9iZSBDaXIsIFRheWxvcnN2aWxsZSwgVVQgODQxMjksIFVTQSIuKiwKFAoSCa8WlGl0jFKHEefX7iBayUYOEhQKEgntMdGIlD1ShxHKMU1IoLdTWw",
            mapUrl: "https://maps.google.com/?q=Adobe+Cir,+Taylorsville,+UT+84129,+USA&ftid=0x87528c74699416af:0xe46c95a20eed7e7",
            coordinates: { lat: 40.6658973, lon: -111.9568344 },
            gmtOffset: -6
        };

        const secondUrl = `${ENV_URL}/v1/events/${eventId}/venues`;

        await axios.post(secondUrl, secondPayload, {
            headers: { Authorization: `Bearer ${Bearer}` }
        });
        console.log('Second request succeeded.');

        const seriesSpeakerPayload = {
            firstName: "Rayyan API",
            lastName: "Speaker",
            title: "API SPEAKER"
        };

        const seriesSpeakerUrl = `${ENV_URL}/v1/series/${serID}/speakers`;

        const response3 = await axios.post(seriesSpeakerUrl, seriesSpeakerPayload, {
            headers: {
                Authorization: `Bearer ${Bearer}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Series speaker created.');
        const speakerId = response3.data.speakerId;
        if (!speakerId) {
            throw new Error('Failed to extract speakerId from response.');
        }

        const eventSpeakerPayload = {
            speakerId: speakerId,
            speakerType: "Speaker",
            ordinal: 0
        };

        const eventSpeakerUrl = `${ENV_URL}/v1/events/${eventId}/speakers`;

        await axios.post(eventSpeakerUrl, eventSpeakerPayload, {
            headers: {
                Authorization: `Bearer ${Bearer}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Event speaker created.');
    } catch (error) {
        console.error('Request failed:', error.message);
        throw error;
    }
});
