# TODO list

## Features
- Guid member add application [/]
- Forms [/]
- Voice channel link [x]
- And roles  [/]
- badges [badge assign,set,role] [/]
- teams / groups [/]
- public rooms
- private rooms
- birthday event
- feeds (future)


## Create Applications
- Membership Application
- Nickname Change
- Create Badge
- Create Team
- Change Badge
- Change Team
- Edit Membership Application
- Schedule a private room. (must be attached to event)
  - time
  - event name
  - event description
  - passkey
  - passkey hint
  - voice channel will only be shown to members when event started

## And Roles
- assign a role when two roles are present to a user

## Private Rooms
- setup rooms channel
- perform only if the creator instantiate a private room. it can be found on his desk channel.
- create event on room created
- rooms embed: join , [members, owner, ]
- rooms thread embed: edit, lock (owner only), end (owner only)
- automatically create a thread when room is created attach it to rooms document
- thread created by private rooms should not be synced.
- add user to the thread when joined to private room

## Rooms
- create a room document (mongodb)
- room embed buttons [enter, lock/unlock, hide/unhide, thread, event, edit]
- when a member joins the voice channel add him/her to the thread if it exist.
- when someone leave, the room startTime is 30 minutes ago and no members left, archive thread,delete the room document, delete the room embed, delete the channel.
- when a user leave and it's the owner pass the ownership to the cohost or the next user in the array.
- lock/unlock (creator only) - shows a modal asking for a passkey, everyone permission to join is set to false.
- enter - shows a modal asking for a passkey. (only show enter button when room is locked/hidden). add user permission to join and view channel.
- hide/unhide (creator only) - if room is locked ask for a passkey,  everyone permission to view is set to false.
- thread - create a thread under rooms name it after the room name. (add all the current members), if thread is already created shows a modal prompting for thread name.
- edit - [room name, room emoji, password, cohost]


# Events
- create an event document (mongodb)
- types: [Scheduled Room, Stage Event, External Event]
- event name
- event start time
- end time
- privacy level, defaults to GUILD_CHANNEL
- entity type
- creator.

# Schedule Room
- room instance create options
- name, emoji, password, locked, hidden, startTime,
- before creating the guildevent create the room but set everyone permission to  view to false.
- when event status change to active, change permissions depending to room description, and event subscribers.






