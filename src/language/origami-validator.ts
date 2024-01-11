import type {  ValidationChecks } from 'langium';
import type { OrigamiAstType } from './generated/ast.js';
import type { OrigamiServices } from './origami-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: OrigamiServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.OrigamiValidator;
    const checks: ValidationChecks<OrigamiAstType> = {
       
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class OrigamiValidator {

    

}
