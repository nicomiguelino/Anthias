#include <QDebug>
#include <QFileInfo>
#include <QUrl>
#include <QStandardPaths>
#include <QEventLoop>
#include <QTimer>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QImage>
#include <QPainter>

#include "view.h"


View::View(QWidget* parent) : QWidget(parent)
{
    webView = new QWebEngineView(this);
    webView->setVisible(false);

    connect(
        webView->page(),
        SIGNAL(authenticationRequired(QNetworkReply*,QAuthenticator*)),
        this,
        SLOT(handleAuthRequest(QNetworkReply*,QAuthenticator*))
    );

    pre_loader = new QWebEnginePage;
    networkManager = new QNetworkAccessManager(this);
    currentImage = QImage();
    nextImage = QImage();
}

void View::loadPage(const QString &uri)
{
    qDebug() << "Type: Webpage";

    // Clear current image if any
    currentImage = QImage();

    // Connect to loadFinished signal with version-specific code
    connect(webView->page(), &QWebEnginePage::loadFinished, this, [=](bool ok) {
        if (ok) {
            qDebug() << "Web page loaded successfully";
            webView->setVisible(true);
            webView->clearFocus();
        } else {
            qDebug() << "Web page failed to load";
        }
#if QT_VERSION >= QT_VERSION_CHECK(6, 0, 0)
    }, Qt::SingleShotConnection);  // Disconnect after first signal
#else
    });
#endif

    // Load the page
    webView->stop();
    webView->load(QUrl(uri));
}

void View::loadImage(const QString &preUri)
{
    qDebug() << "Type: Image";

    QFileInfo fileInfo = QFileInfo(preUri);
    QString src;

    if (fileInfo.isFile())
    {
        qDebug() << "Location: Local File";
        qDebug() << "File path:" << fileInfo.absoluteFilePath();

        QUrl url;
        url.setScheme("http");
        url.setHost("anthias-nginx");
        url.setPath("/screenly_assets/" + fileInfo.fileName());

        src = url.toString();
        qDebug() << "Generated URL:" << src;
    }
    else if (preUri == "null")
    {
        qDebug() << "Black page";
        currentImage = QImage();
        webView->setVisible(false);
        update();
        return;
    }
    else
    {
        qDebug() << "Location: Remote URL";
        src = preUri;
    }

    qDebug() << "Loading image from:" << src;

    // Start loading the next image
    QNetworkRequest request(src);
    QNetworkReply* reply = networkManager->get(request);

    connect(reply, &QNetworkReply::finished, this, [=]() {
        if (reply->error() == QNetworkReply::NoError) {
            QImage newImage;
            QByteArray data = reply->readAll();
            qDebug() << "Received image data size:" << data.size();

            if (newImage.loadFromData(data)) {
                qDebug() << "Successfully loaded image. Size:" << newImage.size();
                nextImage = newImage;
                // Only hide web view and update current image after the new image is loaded
                webView->setVisible(false);
                currentImage = nextImage;
                update();
            } else {
                qDebug() << "Failed to load image from data";
            }
        } else {
            qDebug() << "Network error:" << reply->errorString();
        }
        reply->deleteLater();
    });

    connect(reply, &QNetworkReply::errorOccurred, this, [=](QNetworkReply::NetworkError error) {
        qDebug() << "Network error occurred:" << error;
        qDebug() << "Error string:" << reply->errorString();
    });
}

void View::setRotation(int degrees)
{
    rotation = degrees;
}

void View::paintEvent(QPaintEvent*)
{
    QPainter painter(this);
    painter.fillRect(rect(), Qt::black);

    if (!currentImage.isNull()) {
        qDebug() << "Painting image. Size:" << currentImage.size();

        // Save the painter state
        painter.save();

        // Translate to center of widget
        painter.translate(width() / 2, height() / 2);

        // Rotate around center
        painter.rotate(rotation);

        // Calculate scaled size considering rotation
        QSize scaledSize = currentImage.size();
        QSize targetSize;

        if (rotation == 90 || rotation == 270) {
            // For portrait mode, we need to fit the image within the rotated dimensions
            // First, calculate how the image would fit in the rotated space
            QSize rotatedWidgetSize(height(), width());
            scaledSize.scale(rotatedWidgetSize, Qt::KeepAspectRatio);

            // Ensure the scaled size doesn't exceed the widget dimensions
            if (scaledSize.width() > height() || scaledSize.height() > width()) {
                scaledSize.scale(height(), width(), Qt::KeepAspectRatio);
            }
        } else {
            // For landscape mode, scale to fit within the widget dimensions
            scaledSize.scale(width(), height(), Qt::KeepAspectRatio);
        }

        qDebug() << "Scaled size:" << scaledSize;

        // Draw image centered at origin
        QRect targetRect(
            -scaledSize.width() / 2,
            -scaledSize.height() / 2,
            scaledSize.width(),
            scaledSize.height()
        );
        painter.drawImage(targetRect, currentImage);

        // Restore painter state
        painter.restore();
    }
}

void View::resizeEvent(QResizeEvent* event)
{
    QWidget::resizeEvent(event);

    // Update web view geometry with rotation
    if (rotation == 90 || rotation == 270) {
        // For 90/270 degree rotation, swap width and height
        webView->setGeometry(0, 0, height(), width());
    } else {
        webView->setGeometry(rect());
    }
}

void View::handleAuthRequest(QNetworkReply* reply, QAuthenticator* auth)
{
    Q_UNUSED(reply)
    Q_UNUSED(auth)
    webView->load(QUrl::fromLocalFile(QStandardPaths::locate(QStandardPaths::AppDataLocation, "res/access_denied.html")));
}
