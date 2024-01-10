import { ValidationChecks } from 'langium';
import { OrigamiAstType } from './generated/ast';
import type { OrigamiServices } from './origami-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: OrigamiServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.OrigamiValidator;
    const checks: ValidationChecks<OrigamiAstType> = {
        //Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class OrigamiValidator {

    /*checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }*/

}
