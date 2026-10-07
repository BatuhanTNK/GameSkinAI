/**
 * @fileoverview Public skin sayfaları için yorum bölümü bileşeni.
 * Yorumları listeler, giriş yapmış kullanıcıların yorum eklemesine ve
 * kendi yorumlarını silmesine olanak sağlar.
 */

import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdChatBubbleOutline, MdSend, MdDeleteOutline, MdPerson } from 'react-icons/md';
import { fetchComments, addComment, deleteComment } from 'lib/social';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'contexts/TranslationContext';
import { useToast } from 'contexts/ToastContext';

/**
 * Yorum bölümü.
 * @param {Object} props
 * @param {string} props.conversionId - Yorumların bağlı olduğu dönüşüm id'si
 * @param {string} props.activeLang - Aktif dil kodu (giriş linki için)
 */
export default function CommentSection({ conversionId, activeLang }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const data = await fetchComments(conversionId);
    setComments(data);
    setLoading(false);
  }, [conversionId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || !user) return;

    setSubmitting(true);
    const { data, error } = await addComment({
      conversionId,
      userId: user.id,
      displayName: user.user_metadata?.display_name || t('common.user'),
      content: trimmed,
    });
    setSubmitting(false);

    if (error) {
      showToast(t('comments.addError'), 'error');
      return;
    }

    setComments((prev) => [data, ...prev]);
    setNewComment('');
    showToast(t('comments.added'), 'success');
  };

  const handleDelete = async (comment) => {
    await deleteComment(comment.id, conversionId, user.id);
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    showToast(t('comments.deleted'), 'info');
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">
      {/* Başlık */}
      <div className="mb-4 flex items-center gap-2">
        <MdChatBubbleOutline className="h-5 w-5 text-brand-500" />
        <h4 className="text-base font-bold text-navy-700 dark:text-white">
          {t('comments.title')} ({comments.length})
        </h4>
      </div>

      {/* Yorum Formu / Giriş Uyarısı */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-5 flex items-start gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('comments.placeholder')}
            maxLength={500}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-navy-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdSend className="h-4 w-4" />
            {t('comments.submit')}
          </button>
        </form>
      ) : (
        <div className="mb-5 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-navy-700 dark:text-gray-400">
          {t('comments.loginPrompt')}{' '}
          <Link
            to={`/${activeLang}/auth/sign-in`}
            className="font-bold text-brand-500 hover:underline"
          >
            {t('comments.loginLink')}
          </Link>
        </div>
      )}

      {/* Yorum Listesi */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-brand-500" />
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
          {t('comments.empty')}
        </p>
      )}

      {!loading && comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl bg-gray-50 p-3.5 dark:bg-navy-700"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                    <MdPerson className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-navy-700 dark:text-white">
                    {comment.display_name || t('common.user')}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString(
                      activeLang === 'en' ? 'en-US' : 'tr-TR'
                    )}
                  </span>
                </div>
                {user && user.id === comment.user_id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment)}
                    title={t('common.delete')}
                    className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                  >
                    <MdDeleteOutline className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

CommentSection.propTypes = {
  conversionId: PropTypes.string.isRequired,
  activeLang: PropTypes.string,
};

CommentSection.defaultProps = {
  activeLang: 'tr',
};
