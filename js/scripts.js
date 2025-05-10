document.addEventListener('DOMContentLoaded', () =>
{
    let form = document.getElementById('formulariHotel');
    let fields = form.querySelectorAll('input, select, textarea');
    let nensInput = document.getElementById('nens');
    let edatsContainer = document.getElementById('edats-nens');
    let edatsWrapper = document.getElementById('edats-nens-container');

    // funció per validar camps individuals senzills
    function validarCamp(field)
    {
        let errorSpan = document.getElementById(`error-${field.id}`);
        if (!errorSpan) return;

        if (!field.checkValidity())
        {
            field.setAttribute('aria-invalid', 'true');
            errorSpan.textContent = field.validationMessage; // això no es pot traduir al català???
        }
        else
        {
            field.setAttribute('aria-invalid', 'false');
            errorSpan.textContent = '';
        }
    }

    // validació inline, activem la funció validarCamp cada cop que escriguio
    fields.forEach(field =>
    {
        if (field.type === 'radio') return; // els radios els tracto apart
        field.addEventListener('input', () => validarCamp(field));
        field.addEventListener('blur', () => validarCamp(field));

        // validació inline específica de dates
        if (field.id === 'data-naixement')
        {
            field.addEventListener('blur', () =>
            {
                let avui = new Date();
                avui.setHours(0, 0, 0, 0); // setejem avui pero amb la hora que sigui 00:00
                let major18 = new Date(avui);
                major18.setFullYear(avui.getFullYear() - 18); // comprovador per saber si una edaat es +18
                let dataUser = new Date(field.value);
                let error = document.getElementById('error-data-naixement');

                if (dataUser > major18)
                {
                    field.setAttribute('aria-invalid', 'true');
                    error.textContent = 'Has de ser major d’edat i la data no pot ser futura.';
                }
                else
                {
                    field.setAttribute('aria-invalid', 'false');
                    error.textContent = '';
                }
            });
        }

        if (field.id === 'data-entrada')
        {
            field.addEventListener('blur', () =>
            {
                let avui = new Date();
                avui.setHours(0, 0, 0, 0);
                let dataEntrada = new Date(field.value);
                let error = document.getElementById('error-data-entrada');

                if (dataEntrada < avui)
                {
                    field.setAttribute('aria-invalid', 'true');
                    error.textContent = 'La data ha de ser avui o posterior.';
                }
                else
                {
                    field.setAttribute('aria-invalid', 'false');
                    error.textContent = '';
                }
            });
        }

        if (field.id === 'data-sortida')
        {
            field.addEventListener('blur', () =>
            {
                let entrada = document.getElementById('data-entrada').value;
                let sortida = field.value;
                let error = document.getElementById('error-data-sortida');

                if (entrada && sortida)
                {
                    let dEntrada = new Date(entrada);
                    let dSortida = new Date(sortida);

                    if (dSortida <= dEntrada)
                    {
                        field.setAttribute('aria-invalid', 'true');
                        error.textContent = 'La data de sortida ha de ser posterior a la de entrada.';
                    } 
                    else
                    {
                        field.setAttribute('aria-invalid', 'false');
                        error.textContent = '';
                    }
                }
            });
        }
    });

    // si ha introduit algun nen, generem un input dins el weapper
    nensInput.addEventListener('input', () =>
    {
        let nens = parseInt(nensInput.value, 10);
        edatsContainer.innerHTML = '';
        if (nens > 0)
        {
            edatsWrapper.classList.remove('amagat');
            for (let i = 0; i < nens; i++)
            {
                let input = document.createElement('input');
                input.type = 'number';
                input.name = `edat-nens-${i}`;
                input.min = 0;
                input.max = 12;
                input.required = true;
                edatsContainer.appendChild(input);

                // validació inline per edats dels nens
                input.addEventListener('blur', () =>
                {
                    let error = document.getElementById('error-edats-nens');
                    if (!input.value || isNaN(input.value) || parseInt(input.value) < 0)
                    {
                        input.setAttribute('aria-invalid', 'true');
                        error.textContent = 'Introdueix edats vàlides per a tots els nens.';
                    }
                    else
                    {
                        input.setAttribute('aria-invalid', 'false');
                        error.textContent = '';
                    }
                });
            }
        }
        else
        {
            edatsWrapper.classList.add('amagat');
        }
    });

    // valiacio de la confirmació
    document.getElementById('confirma').addEventListener('input', () =>
    {
        let pass = document.getElementById('contrasenya').value;
        let confirm = document.getElementById('confirma').value;
        let error = document.getElementById('error-confirma');
        let input = document.getElementById('confirma');

        if (confirm !== pass)
        {
            input.setAttribute('aria-invalid', 'true');
            error.textContent = 'Les contrasenyes no coincideixen.';
        }
        else
        {
            input.setAttribute('aria-invalid', 'false');
            error.textContent = '';
        }
    });

    // validació a l'enviar
    form.addEventListener('submit', (e) =>
    {
        e.preventDefault();

        let errors = [];
        let firstError = null;

        // Validació general
        fields.forEach(field =>
        {
            if (field.type === 'radio') return;
            let errorSpan = document.getElementById(`error-${field.id}`);
            if (!errorSpan) return;

            field.setAttribute('aria-invalid', 'false');
            errorSpan.textContent = '';

            if (!field.checkValidity())
            {
                let msg = field.validationMessage; // això no es pot traduir a català???
                errorSpan.textContent = msg;
                field.setAttribute('aria-invalid', 'true');
                if (!firstError)
                {
                    firstError = field;
                }
                errors.push(msg);
            }
        });

        // validació dels radios
        let propositRadios = form.querySelectorAll('input[name="proposit"]');
        let propositValid = Array.from(propositRadios).some(r => r.checked);
        let propositError = document.getElementById('error-proposit');

        if (!propositValid)
        {
            propositError.textContent = 'Selecciona un propòsit.';
            if (!firstError)
            {
                firstError = propositRadios[0];
            }
            errors.push('Propòsit requerit');
        }
        else
        {
            propositError.textContent = '';
        }

        // validació contrasenyes
        let pass = document.getElementById('contrasenya');
        let confirm = document.getElementById('confirma');
        let errorConfirm = document.getElementById('error-confirma');

        if (pass.value != confirm.value)
        {
            confirm.setAttribute('aria-invalid', 'true');
            errorConfirm.textContent = 'Les contrasenyes no coincideixen.';
            if (!firstError) firstError = confirm;
            errors.push('Contrasenyes diferents');
        }

        // validació de dates
        function parseDate(value)
        {
            let parts = value.split("-");
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }

        let avui = new Date();
        avui.setHours(0, 0, 0, 0); // posem el dia com avui a les 00 de la nit
        let major18 = new Date(avui);
        major18.setFullYear(avui.getFullYear() - 18);

        // data de naixement
        let dataNaix = document.getElementById('data-naixement');
        let errorNaix = document.getElementById('error-data-naixement');
        if (dataNaix.value && parseDate(dataNaix.value) > major18)
        {
            errorNaix.textContent = 'Has de ser major d’edat i la data no pot ser futra';
            dataNaix.setAttribute('aria-invalid', 'true');
            if (!firstError)
            {
                firstError = dataNaix;
            }
            errors.push('Data de naixement no vàlida');
        }

        let entrada = document.getElementById('data-entrada');
        let sortida = document.getElementById('data-sortida');
        let errorEntrada = document.getElementById('error-data-entrada');
        let errorSortida = document.getElementById('error-data-sortida');

        // validació de l'entrada que sigui d'avui o futura
        if (entrada.value && parseDate(entrada.value) < avui)
        {
            errorEntrada.textContent = 'La data ha de ser avui o posterior.';
            entrada.setAttribute('aria-invalid', 'true');

            if (!firstError)
            {
                firstError = entrada;
            }
            errors.push('Data entrada no vàlida');
        }

        // validació data sortida que sigui posterior a la d'entrada
        if (entrada.value && sortida.value)
        {
            let dEntrada = parseDate(entrada.value);
            let dSortida = parseDate(sortida.value);
            if (dSortida <= dEntrada)
            {
                errorSortida.textContent = 'La data de sortida ha de ser posterior a la deentrada.';
                sortida.setAttribute('aria-invalid', 'true');
                if (!firstError)
                {
                    firstError = sortida;
                }
                errors.push('Data sortida no vàlida');
            }
        }

        // validació edats dels nens 
        let edatsInputs = edatsContainer.querySelectorAll('input');
        edatsInputs.forEach((input, index) =>
        {
            input.setAttribute('aria-invalid', 'false');
            if (!input.value || isNaN(input.value) || parseInt(input.value) < 0)
            {
                input.setAttribute('aria-invalid', 'true');
                errors.push(`Edat del nen ${index + 1} no vàlida`);
                if (!firstError)
                {
                    firstError = input;
                }

                let spanError = document.getElementById('error-edats-nens');
                if (spanError)
                {
                    spanError.textContent = 'Introdueix edats vàlides per a tots els nens.';
                }
            }
        });

        // mostrar errors si hi han
        let notify = document.getElementById('notificacio-errors');
        if (errors.length > 0)
        {
            notify.classList.remove('amagat');
            notify.textContent = 'Hi ha errors al formulari. Reviseu els camps.';
            notify.style = "color: red";
            firstError.focus();
        }
        else
        {
            window.location.href = "habitacions.html";
        }
    });
});    