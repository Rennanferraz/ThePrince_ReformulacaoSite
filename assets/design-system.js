"use strict";
(() => {
  const modal = document.getElementById("ds-dialog");
  let origin;
  function open(title, content, trigger) {
    origin = trigger || document.activeElement;
    document.getElementById("ds-dialog-title").textContent = title;
    document.getElementById("ds-dialog-body").replaceChildren();
    const p = document.createElement("p");
    p.textContent = content;
    p.style.whiteSpace = "pre-wrap";
    document.getElementById("ds-dialog-body").append(p);
    modal.showModal();
    modal.querySelector(".close").focus();
  }
  modal.querySelector(".close").addEventListener("click", () => modal.close());
  modal.addEventListener("close", () => {
    if (origin) origin.focus();
  });
  document.querySelectorAll(".ds-illustrative").forEach((b) =>
    b.addEventListener("click", () => {
      document.getElementById("ds-action-status").textContent =
        "Exemplo de componente: nenhuma ação externa foi executada.";
    }),
  );
  document.querySelectorAll("[data-ds-subject]").forEach((a) =>
    a.addEventListener("click", () => {
      document.getElementById("ds-subject").value = a.dataset.dsSubject;
      document.getElementById("ds-context").textContent =
        "Assunto preenchido a partir do cartão. Você pode alterá-lo.";
    }),
  );
  document.getElementById("ds-name").addEventListener("input", (e) => {
    e.target.removeAttribute("aria-invalid");
    document.getElementById("ds-name-error").hidden = true;
  });
  document.getElementById("ds-demo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("ds-name");
    if (!name.value.trim()) {
      name.setAttribute("aria-invalid", "true");
      document.getElementById("ds-name-error").hidden = false;
      document.getElementById("ds-form-status").textContent =
        "Informe o nome fictício para revisar.";
      name.focus();
      return;
    }
    const subject = document.getElementById("ds-subject").value,
      channel = document.querySelector('[name="ds-channel"]:checked').value,
      message = document.getElementById("ds-message").value.trim();
    open(
      "Exemplo de revisão — " + channel,
      "Mensagem preparada, não enviada.\n\nNome: " +
        name.value.trim() +
        "\nAssunto: " +
        subject +
        "\nMensagem: " +
        (message || "Gostaria de mais informações.") +
        "\n\nEste exemplo do guia não abre aplicativos. Na home, a etapa seguinte abre o canal escolhido.",
      e.submitter,
    );
  });
  document
    .getElementById("ds-toggle-password")
    .addEventListener("click", (e) => {
      const input = document.getElementById("ds-password"),
        visible = input.type === "password";
      input.type = visible ? "text" : "password";
      e.currentTarget.setAttribute("aria-pressed", String(visible));
      e.currentTarget.setAttribute(
        "aria-label",
        visible
          ? "Ocultar senha de demonstração"
          : "Mostrar senha de demonstração",
      );
    });
  document
    .getElementById("ds-access-info")
    .addEventListener("click", (e) =>
      open(
        "Acesso do aluno — demonstração",
        "Home → Área do aluno → tela com conta fictícia → curso de francês em outra aba.\n\nO protótipo não autentica pessoas, não cria sessão e não restringe o acesso ao curso. Recuperação de senha e autenticação serão definidas em outra etapa.",
        e.currentTarget,
      ),
    );
  document.querySelectorAll(".ds-faq details").forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open)
        document.querySelectorAll(".ds-faq details").forEach((o) => {
          if (o !== d) o.open = false;
        });
    }),
  );
})();
