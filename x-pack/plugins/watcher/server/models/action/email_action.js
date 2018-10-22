/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { badRequest } from 'boom';
import { BaseAction } from './base_action';
import { ACTION_TYPES } from '../../../common/constants';
import { i18n } from '@kbn/i18n';

export class EmailAction extends BaseAction {
  constructor(props, errors) {
    props.type = ACTION_TYPES.EMAIL;
    super(props, errors);

    this.to = props.to;
    this.subject = props.subject;
    this.body = props.body;
  }

  // To Kibana
  get downstreamJson() {
    const result = super.downstreamJson;
    Object.assign(result, {
      to: this.to,
      subject: this.subject,
      body: this.body
    });

    return result;
  }

  // From Kibana
  static fromDownstreamJson(json) {
    const props = super.getPropsFromDownstreamJson(json);

    Object.assign(props, {
      to: json.to,
      subject: json.subject,
      body: json.body,
    });

    return new EmailAction(props);
  }

  // To Elasticsearch
  get upstreamJson() {
    const result = super.upstreamJson;

    const optionalFields = {};
    if (this.subject) {
      optionalFields.subject = this.subject;
    }
    if (this.body) {
      optionalFields.body = { text: this.body };
    }

    result[this.id] = {
      email: {
        profile: 'standard',
        to: this.to,
        ...optionalFields,
      }
    };

    return result;
  }

  // From Elasticsearch
  static fromUpstreamJson(json, options = { throwExceptions: {} }) {
    const props = super.getPropsFromUpstreamJson(json);
    const doThrowException = options.throwExceptions.Action !== false;
    const { errors } = this.validateJson(json, doThrowException);

    const optionalFields = {};
    if (json.actionJson.email.subject) {
      optionalFields.subject = json.actionJson.email.subject;
    }
    if (json.actionJson.email.body) {
      optionalFields.body = json.actionJson.email.body.text;
    }

    Object.assign(props, {
      to: json.actionJson.email.to,
      subject: json.actionJson.email.subject,
      ...optionalFields,
    });

    return new EmailAction(props, errors);
  }

  static validateJson(json, doThrowException) {
    const errors = [];

    if (!json.actionJson.email) {
      const message = i18n.translate('xpack.watcher.models.emailAction.absenceOfActionJsonEmailPropertyBadRequestMessage', {
        defaultMessage: 'json argument must contain an {actionJsonEmail} property',
        values: {
          actionJsonEmail: 'actionJson.email'
        }
      });

      if (doThrowException) {
        throw badRequest(message);
      }

      errors.push({
        code: 'ERR_PROP_MISSING',
        message
      });
    }

    if (!json.actionJson.email.to) {
      const message = i18n.translate('xpack.watcher.models.emailAction.absenceOfActionJsonEmailToPropertyBadRequestMessage', {
        defaultMessage: 'json argument must contain an {actionJsonEmailTo} property',
        values: {
          actionJsonEmailTo: 'actionJson.email.to'
        }
      });

      if (doThrowException) {
        throw badRequest(message);
      }
      errors.push({
        code: 'ERR_PROP_MISSING',
        message
      });
    }

    return { errors: errors.length ? errors : null };
  }

  /*
  json.actionJson should have the following structure:
  {
    "email" : {
      "profile": "standard",
      "to" : "foo@bar.com",  // or [ "foo@bar.com", "bar@foo.com" ]
      "subject" : "foobar subject",
      "body" : {
        "text" : foobar body text"
      }
    }
  }
  */
}
