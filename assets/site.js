/* Protótipo de design v0.5. Sem autenticação, backend, analytics ou persistência.
   O curso só é aberto por clique explícito. Canais confirmados; abertura somente após ação explícita do visitante.
   Não inserir credenciais, tokens ou senhas reais neste arquivo. */
"use strict";
(() => {
  const DESTINATIONS = Object.freeze({
    whatsapp: "5521996595961",
    email: "contato@theprince.com.br",
  }); // Canais confirmados por Renan; nenhum envio automático.
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#menu-principal");
  const modal = document.querySelector("#preview-dialog");
  const modalTitle = document.querySelector("#dialog-title");
  const modalBody = document.querySelector("#dialog-body");
  const subject = document.querySelector("#assunto");
  const form = document.querySelector("#contact-form");
  const context = document.querySelector("#context-status");
  const loginView = document.querySelector("#student-view");
  const homeViews = document.querySelectorAll("[data-home-view]");
  document.querySelector("#demo-fields").disabled = false;
  let origin = null;
  function closeMenu(returnFocus = false) {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.open && nav.classList.contains("open"))
      closeMenu(true);
  });
  window
    .matchMedia("(min-width:1101px)")
    .addEventListener("change", () => closeMenu());
  function showView(hash, focus = false) {
    const login = hash === "#login";
    homeViews.forEach((el) => {
      el.hidden = login;
    });
    loginView.hidden = !login;
    document.querySelector(".skip").href = login ? "#login" : "#conteudo";
    document.title = login
      ? "The Prince — Área do aluno · demonstração"
      : "The Prince — Home e acesso do aluno · prévia para avaliação · v0.5";
    if (focus) {
      const id = login ? "login-title" : (hash || "#conteudo").slice(1);
      const target =
        document.getElementById(id) || document.querySelector("#conteudo");
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        if (login) window.scrollTo({ top: 0, behavior: "instant" });
        else target.scrollIntoView({ block: "start" });
      }
    }
  }
  function clearError(input) {
    input.removeAttribute("aria-invalid");
    const error = document.getElementById(input.id + "-error");
    if (error) error.hidden = true;
  }
  function selectSubject(key, announce = true) {
    if (!Array.from(subject.options).some((o) => o.value === key)) return;
    subject.value = key;
    clearError(subject);
    context.textContent = announce
      ? "Assunto preenchido a partir da sua escolha. Você pode alterá-lo."
      : "";
  }
  document.querySelectorAll('a[href^="#"]').forEach((link) =>
    link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const hash = link.getAttribute("href");
      if (link.dataset.interest) selectSubject(link.dataset.interest);
      closeMenu();
      showView(hash, false);
      if (location.hash !== hash) location.hash = hash;
      showView(hash, true);
    }),
  );
  window.addEventListener("hashchange", () => showView(location.hash, false));
  showView(location.hash, false);
  subject.addEventListener("change", () => {
    context.textContent = "";
    clearError(subject);
  });
  function channel() {
    return form.querySelector('input[name="envio"]:checked').value;
  }
  function updateChannel() {
    const whatsapp = channel() === "whatsapp";
    document.querySelector("#send-label").textContent = whatsapp
      ? "Continuar no WhatsApp"
      : "Preparar e-mail";
    document.querySelector("#channel-hint").textContent = whatsapp
      ? "A conversa será aberta com a mensagem pronta. Você confirma o envio no WhatsApp."
      : "Seu aplicativo de e-mail será aberto com assunto e mensagem prontos. Você confirma o envio por lá.";
  }
  form
    .querySelectorAll('[name="envio"]')
    .forEach((input) => input.addEventListener("change", updateChannel));
  form
    .querySelectorAll("input,textarea")
    .forEach((input) =>
      input.addEventListener("input", () => clearError(input)),
    );
  function showModal(title, trigger) {
    origin = trigger || document.activeElement;
    modalTitle.textContent = title;
    modal.showModal();
    modal.querySelector(".close").focus();
  }
  function node(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function makeMessage() {
    const name = document.querySelector("#nome").value.trim();
    const interest = subject.selectedOptions[0].textContent.trim();
    const objective = document.querySelector("#mensagem").value.trim();
    return [
      "Olá, The Prince! Vim pelo site e gostaria de conversar.",
      `Meu nome é ${name}.`,
      `Interesse: ${interest}.`,
      objective
        ? `Minha mensagem: ${objective}`
        : "Gostaria de receber mais informações sobre esse assunto.",
    ].join("\n\n");
  }
  function recipientLink(type, message) {
    if (type === "whatsapp" && /^[1-9]\d{7,14}$/.test(DESTINATIONS.whatsapp))
      return `https://wa.me/${DESTINATIONS.whatsapp}?text=${encodeURIComponent(message)}`;
    if (
      type === "email" &&
      /^[^\s@?&#\r\n]+@[^\s@?&#\r\n]+\.[^\s@?&#\r\n]+$/.test(DESTINATIONS.email)
    )
      return `mailto:${DESTINATIONS.email}?subject=${encodeURIComponent("The Prince | " + subject.selectedOptions[0].textContent.trim())}&body=${encodeURIComponent(message)}`;
    return null;
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalid = [];
    [subject, document.querySelector("#nome")].forEach((input) => {
      clearError(input);
      if (!input.value.trim() || !input.checkValidity()) {
        invalid.push(input);
        input.setAttribute("aria-invalid", "true");
        document.getElementById(input.id + "-error").hidden = false;
      }
    });
    if (invalid.length) {
      document.querySelector("#form-status").textContent =
        "Revise os campos indicados para continuar.";
      invalid[0].focus();
      return;
    }
    const whatsapp = channel() === "whatsapp",
      message = makeMessage();
    document.querySelector("#form-status").textContent =
      "Mensagem pronta para revisão. Nada foi enviado.";
    modalBody.replaceChildren();
    modalBody.append(
      node(
        "p",
        "Mensagem pronta para revisão. Nada foi enviado.",
        "state-banner",
      ),
    );
    modalBody.append(
      node(
        "p",
        whatsapp
          ? "O WhatsApp receberá o assunto e o texto abaixo para você revisar antes de enviar."
          : "Seu aplicativo de e-mail receberá o assunto e o texto abaixo para você revisar antes de enviar.",
      ),
    );
    if (!whatsapp)
      modalBody.append(
        node(
          "p",
          "Assunto: The Prince | " +
            subject.selectedOptions[0].textContent.trim(),
          "recipient-note",
        ),
      );
    const preview = node("div", message, "message-preview");
    preview.setAttribute("tabindex", "0");
    preview.setAttribute("aria-label", "Mensagem preparada");
    modalBody.append(preview);
    const destination = whatsapp ? DESTINATIONS.whatsapp : DESTINATIONS.email;
    const link = recipientLink(channel(), message);
    modalBody.append(
      node(
        "p",
        link
          ? `Destinatário: ${destination}`
          : (whatsapp
              ? "Número oficial da The Prince a confirmar."
              : "E-mail oficial da The Prince a confirmar.") +
              " O encaminhamento está desativado nesta apresentação.",
        "recipient-note",
      ),
    );
    const actions = document.createElement("div");
    actions.className = "dialog-actions";
    if (link) {
      const action = node(
        "a",
        whatsapp ? "Abrir WhatsApp para enviar" : "Abrir aplicativo de e-mail",
        "button",
      );
      action.href = link;
      if (whatsapp) {
        action.target = "_blank";
        action.rel = "noopener noreferrer";
        action.referrerPolicy = "no-referrer";
        action.append(node("span", " (abre em outra aba)", "sr-only"));
      }
      actions.append(action);
    } else {
      const disabled = node(
        "button",
        whatsapp ? "WhatsApp a confirmar" : "E-mail a confirmar",
        "button",
      );
      disabled.type = "button";
      disabled.disabled = true;
      actions.append(disabled);
    }
    const copy = node("button", "Copiar mensagem", "button button-secondary");
    copy.type = "button";
    actions.append(copy);
    const edit = node("button", "Voltar e editar", "text-button");
    edit.type = "button";
    edit.addEventListener("click", () => modal.close());
    actions.append(edit);
    modalBody.append(actions);
    const status = node("p", "", "copy-feedback");
    status.setAttribute("aria-live", "polite");
    modalBody.append(status);
    copy.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard) throw new Error("clipboard unavailable");
        await navigator.clipboard.writeText(message);
        status.textContent = "Mensagem copiada. Nenhum envio realizado.";
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(preview);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent =
          "Texto selecionado. Use a opção Copiar do seu navegador ou Ctrl+C / ⌘C.";
      }
    });
    showModal(
      whatsapp
        ? "Sua mensagem para o WhatsApp"
        : "Seu e-mail para a The Prince",
      form.querySelector('[type="submit"]'),
    );
  });
  const infos = {
    privacidade: {
      title: "Privacidade — conteúdo a validar",
      paragraphs: [
        "A política de privacidade será adequada aos canais e processos que a The Prince decidir adotar. Esta tela não é uma política jurídica aprovada.",
        "Esta prévia solicita a fonte Inter ao Google Fonts. Não autentica pessoas nem persiste os campos. Ao escolher abrir WhatsApp ou e-mail, a mensagem é encaminhada ao aplicativo externo; você confirma o envio por lá. Curso e redes sociais também são destinos externos, com suas próprias práticas. Use dados fictícios na avaliação.",
      ],
    },
    recursos: {
      title: "Parcerias e recursos",
      paragraphs: [
        "Esta entrada está preservada na navegação de apoio. A curadoria de links e a comprovação de vínculos precisam de validação antes de incluir parceiros ou logotipos.",
        "A página interna não faz parte desta entrega.",
      ],
    },
    senha: {
      title: "Recuperação de acesso",
      paragraphs: [
        "No site final, este link conduzirá à recuperação de senha. O fluxo e o serviço de autenticação serão definidos em uma etapa técnica posterior.",
        "Nesta apresentação, a conta é fictícia e os campos já estão preenchidos. Nenhum pedido de recuperação é enviado. Use “Entrar e acessar o curso” para demonstrar a chegada ao material.",
      ],
    },
    notas: {
      title: "Como avaliar esta proposta",
      paragraphs: [
        "Ali, esta é uma prévia do novo site da The Prince. Avalie a apresentação das aulas e traduções, a clareza dos textos, as ilustrações e a experiência no computador e no celular.",
        "Comece pela página inicial, explore as ofertas e teste o menu. O assunto escolhido acompanha você até o formulário e continua editável. As páginas internas completas serão desenvolvidas depois desta validação.",
        "Em Área do aluno, os dados são fictícios e somente leitura. “Entrar e acessar o curso” abre o material de francês em outra aba. Não há autenticação real nem proteção de acesso nesta demonstração.",
        "Para conferir o contato, use dados fictícios, escolha WhatsApp ou e-mail e revise a mensagem. Você pode fechar a revisão sem abrir o aplicativo. Os destinatários são reais: não é necessário enviar uma mensagem para avaliar o percurso.",
        "Confira especialmente a trajetória e as informações institucionais marcadas para validação, os serviços ativos e os canais de atendimento. Anote o nome da seção e o ajuste desejado; uma captura da tela ajuda a localizar o ponto.",
        "O Guia visual reúne os componentes usados na proposta. A prévia usa Inter para reproduzir as capturas avaliadas; a definição nominal dos títulos no sistema final permanece em revisão. A fonte é solicitada ao Google Fonts, com alternativa local quando indisponível.",
      ],
    },
  };
  document.querySelectorAll("[data-info]").forEach((button) =>
    button.addEventListener("click", () => {
      const info = infos[button.dataset.info];
      if (!info) return;
      modalBody.replaceChildren();
      info.paragraphs.forEach((text) => modalBody.append(node("p", text)));
      showModal(info.title, button);
    }),
  );
  document.querySelector("#toggle-password").addEventListener("click", (e) => {
    const button = e.currentTarget,
      input = document.querySelector("#student-password"),
      visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute(
      "aria-label",
      visible
        ? "Ocultar senha de demonstração"
        : "Mostrar senha de demonstração",
    );
  });
  document.querySelector("#enter-course").addEventListener("click", () => {
    document.querySelector("#course-status").textContent =
      "O curso será aberto em outra aba. Este é um percurso de demonstração, sem autenticação.";
  });
  modal.querySelector(".close").addEventListener("click", () => modal.close());
  modal.addEventListener("close", () => {
    if (origin && document.contains(origin)) origin.focus();
  });
  document.querySelectorAll(".faq details").forEach((detail) =>
    detail.addEventListener("toggle", () => {
      if (detail.open)
        document.querySelectorAll(".faq details").forEach((other) => {
          if (other !== detail) other.open = false;
        });
    }),
  );
})();
