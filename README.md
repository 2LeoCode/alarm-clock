# Alarm Clock

_A little clock and alarm gestion app_

## How to use

To build the app: `npm run build`
To launch the app: `npm run prod`

On first launch you will see a clock on the left showing the current time and an empty alarm section on the right.
To add an alarm, click on the **+** button on the top right of the screen, next to **Alarms**, you will then be redirected to the **alarm editor** page where you can select the date and time of your alarm, you can also set a custom message for your alarm that will be shown when the alarm gets triggered.
When you want to save the alarm, just click **OK** on the bottom right of the screen, and if you changed your mind and don't want to save the alarm anymore, just click **CANCEL**.
When you saved some alarms, they will be shown on the right of the screen, and if you add a lot of alarms, you can scroll between them using the scrollbar or your mouse wheel.
If you want to remove an alarm, just click the **-** button on the right of the alarm you want to remove.
If you want to edit an alarm, just click anywhere on the alarm you want to edit, it will then redirect you back on the alarm editor page, when the modifications are done you can either click **OK** to save your changes, or **CANCEL** to discard them.
If you close the app for some time and reopen it later, you will be prompted with a message listing all alarms that were triggered while the app was closed.

## Possible upgrades

- Adding a way to reshedule an alarm to later when it triggers.
- Adding a "week system" (possibility to shedule an alarm for multiple days in the week).
