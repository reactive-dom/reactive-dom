import { Context, Control } from '@reactive-dom/api';
import { ReplaySubject } from 'rxjs';

/**
 * Bootstraps the application root `control`.
 *
 * @param   control - The application root Control.
 * @returns Object to terminate the application.
 */
export function bootstrap(control: Control<Context>): { terminate(): void } {
    const destroyNotifier = new ReplaySubject(1);
    const context = {
        onDetach(handler: () => void) {
            return destroyNotifier.subscribe(handler);
        },
    };

    control.init(context);

    return {
        terminate() {
            destroyNotifier.next();
        },
    };
}
