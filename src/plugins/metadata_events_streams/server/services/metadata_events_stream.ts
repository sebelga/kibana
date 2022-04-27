/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { StreamName, MetadataEvent } from '../types';
import { MetadataEventsStreamsIndex } from './metadata_events_streams_index';

interface Dependencies {
  metadataEventsStreamsIndex: MetadataEventsStreamsIndex;
}
export class MetadataEventsStream<E extends MetadataEvent> {
  streamName: StreamName;

  private metadataEventsStreamsIndex: MetadataEventsStreamsIndex;

  constructor(streamName: StreamName, { metadataEventsStreamsIndex }: Dependencies) {
    this.streamName = streamName;
    this.metadataEventsStreamsIndex = metadataEventsStreamsIndex;
  }

  registerEvent(event: E): void {
    return this.metadataEventsStreamsIndex.addEventToStream<E>(this.streamName, event);
  }
}
