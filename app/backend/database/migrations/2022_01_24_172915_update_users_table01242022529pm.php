<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateUsersTable01242022529pm extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('front_id')->default('../../../assets/admin/img/noimage.png');
            $table->string('back_id')->default('../../../assets/admin/img/noimage.png');
            $table->string('selfie_id')->default('../../../assets/admin/img/noimage.png');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
